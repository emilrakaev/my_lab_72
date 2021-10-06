from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ViewSet
from api.serializers import QuoteCreateSerializer, QuoteUpdateSerializer, QuoteSerializer
from webapp.models import Quote, Vote
from .permissions import QuotePermissions
from django.contrib.sessions.models import Session


@ensure_csrf_cookie
def get_token_view(request, *args, **kwargs):
    if request.method == 'GET':
        return HttpResponse()
    return HttpResponseNotAllowed('Only GET request are allowed')


class QuoteViewSet(ModelViewSet):
    permission_classes = [QuotePermissions]

    def get_queryset(self):
        if self.request.method == 'GET' and \
                not self.request.user.has_perm('webapp.quote_view'):
            return Quote.get_moderated()
        return Quote.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QuoteCreateSerializer
        elif self.request.method == 'PUT':
            return QuoteUpdateSerializer
        return QuoteSerializer

    @action(methods=['post'], detail=True)
    def Up(self, request, pk=None):
        if not self.request.session.session_key:
            self.request.session.save()
        session = Session.objects.get(session_key=self.request.session.session_key)
        quote = get_object_or_404(Quote, pk=pk)
        try:
            print(session.session_key)
            vote = Vote.objects.get(quote_id=quote.pk, session_key=session.session_key)
        except ObjectDoesNotExist:
            print(quote.status)
            vote = Vote.objects.create(rating=1, quote_id=quote.pk, session_key=session.session_key)
            quote.rating += 1
            quote.save()
        return Response({'rating': quote.rating})

    @action(methods=['post'], detail=True)
    def Down(self, request, pk=None):
        if not self.request.session.session_key:
            self.request.session.save()
        session = Session.objects.get(session_key=self.request.session.session_key)
        quote = get_object_or_404(Quote, pk=pk)
        try:
            vote = Vote.objects.get(quote_id=quote.pk,  session_key=session.session_key)
        except ObjectDoesNotExist:
            print(quote.status)
            vote = Vote.objects.create(rating=-1, quote_id=quote.pk, session_key=session.session_key)
            quote.rating -= 1
            quote.save()
        return Response({'rating': quote.rating})
