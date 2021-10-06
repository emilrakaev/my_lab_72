from django.db import models


STATUS_NEW = 'new'
STATUS_MODERATED = 'moderated'
STATUS_CHOICES = (
    (STATUS_NEW, 'Новая'),
    (STATUS_MODERATED, 'Модерированная')
)
DEFAULT_STATUS = STATUS_NEW


class Quote(models.Model):
    text = models.TextField(max_length=2000, verbose_name='Текст')
    author = models.CharField(max_length=100, verbose_name='Автор')
    email = models.EmailField(verbose_name='Email')
    rating = models.IntegerField(default=0, verbose_name='Рейтинг')
    status = models.CharField(max_length=15, verbose_name='Статус',
                              choices=STATUS_CHOICES, default=DEFAULT_STATUS)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')

    @classmethod
    def get_moderated(cls):
        return cls.objects.filter(status=STATUS_MODERATED)

    def __str__(self):
        return f'{self.text[:20]}'

    class Meta:
        verbose_name = 'Цитата'
        verbose_name_plural = 'Цитаты'
        ordering = ('-created_at',)


class Vote(models.Model):
    session_key = models.CharField(max_length=40, verbose_name='Ключ сессии')
    quote = models.ForeignKey(Quote, related_name='votes', on_delete=models.CASCADE,
                              verbose_name='Цитата')
    rating = models.IntegerField(choices=((1, 'up'), (-1, 'down')), verbose_name='Рейтинг')

    def __str__(self):
        return f'{self.rating} {self.quote}'

    class Meta:
        verbose_name = 'Рейтинг'
        verbose_name_plural = 'Рейтинги'
        ordering = ('quote', 'rating')