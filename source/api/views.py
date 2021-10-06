from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from api.permissions import QuotePermissions
from api.serializers import QuoteCreateSerializer, QuoteUpdateSerializer, QuoteSerializer
from webapp.models import Quote, Vote


class QuoteViewSet(ModelViewSet):
    permission_classes = [QuotePermissions]

    def get_queryset(self):
        if self.request.method == 'GET' and not self.request.user.has_perm('webapp.quote_view'):
            return Quote.get_moderated()
        return Quote.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QuoteCreateSerializer
        elif self.request.method == 'PUT':
            return QuoteUpdateSerializer
        return QuoteSerializer


@action(methods=['post'], detail=True)
def VoteUp(self, request, pk=None):
    quote = get_object_or_404(Quote, pk=pk)
    like, created = Vote.objects.get_or_create(quote=quote, user=request.sesion.key)
    if created:
        quote.rating += 1
        quote.save()
        return Response({'pk': pk, 'rating': quote.rating})
    else:
        return Response(status=403)


@action(methods=['delete'], detail=True)
def VoteDown(self, request, pk=None):
    article = get_object_or_404(Article, pk=pk)
    like = get_object_or_404(article.likes, user=request.user)
    like.delete()
    article.like_count -= 1
    article.save()
    return Response({'pk': pk, 'likes': article.like_count})
