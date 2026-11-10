# Web Premium para tu Negocio

Este kit crea webs profesionales con animaciones de scroll para cualquier tipo de negocio. Cada cliente tiene su propio proyecto en una subcarpeta independiente dentro de `proyectos/`.

## Proyectos existentes

- `./` (raíz) — **Vant Store** (perfumería, en producción en vant-store.com) — NO mover, está desplegado en Cloudflare Pages
- `proyectos/<nombre>/` — nuevos clientes van aquí, cada uno con su propio repo y despliegue

## Comportamiento al iniciar

Cuando el usuario abra esta carpeta y escriba cualquier cosa, responde:

> **Bienvenido al creador de webs premium**
>
> Tengo estos proyectos existentes:
> - **Vant Store** (raíz) — perfumería, en producción en vant-store.com
>
> ¿Quieres trabajar en Vant Store o crear una web para un cliente nuevo?

Si elige **Vant Store**: trabaja sobre `index.html` en la raíz.

Si elige **cliente nuevo**: pregunta `¿Cómo se llama el negocio y a qué se dedica?` y crea la subcarpeta `proyectos/<nombre-negocio>/` con todos los archivos ahí dentro.

Después usa la skill `web-scrolling` automáticamente.

## Estructura de carpetas

```
kit-web-scrolling/
├── index.html            ← Vant Store (en producción, no mover)
├── assets/               ← assets de Vant Store
├── proyectos/
│   ├── cliente-2/        ← nuevos clientes van aquí
│   └── cliente-3/
└── CLAUDE.md             ← este archivo (la skill)
```

## Cómo funciona

1. Claude pregunta si es Vant Store o cliente nuevo
2. Para Vant Store: edita `index.html` en la raíz
3. Para cliente nuevo: crea `proyectos/<nombre>/index.html` y `proyectos/<nombre>/assets/`
4. Cada cliente nuevo necesita su propio repositorio GitHub y Cloudflare Pages
5. Al crear proyecto nuevo, actualizar la lista "Proyectos existentes" de este CLAUDE.md

## Reglas

- Vant Store siempre en la raíz (producción activa, no mover nunca)
- Cada cliente nuevo en su propia subcarpeta `proyectos/<nombre>/`
- Nunca mezclar archivos de distintos clientes
- Solo usa datos reales — nunca inventar información
- Si no tiene fotos, usa placeholders y avisa dónde ponerlas
- Si no tiene testimonios, omite esa sección

## Si el cliente tiene un vídeo

- Vant Store: `assets/hero.mp4`
- Cliente nuevo: `proyectos/<nombre>/assets/hero.mp4`

Pide "quiero el efecto de vídeo con scroll". El vídeo avanzará fotograma a fotograma con el scroll, como en la web de Apple.
