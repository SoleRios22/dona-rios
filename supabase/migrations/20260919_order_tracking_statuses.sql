alter type public.order_status
add value if not exists 'en_preparacion'
after 'confirmado';

alter type public.order_status
add value if not exists 'en_camino'
after 'en_preparacion';