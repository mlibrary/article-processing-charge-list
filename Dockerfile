FROM httpd:latest AS base

FROM base AS development

FROM base AS production

COPY ./html/ /usr/local/apache2/htdocs/
