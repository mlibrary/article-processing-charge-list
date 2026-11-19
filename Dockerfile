# Copyright (c) 2026, Regents of the University of Michigan. All rights reserved.
# See LICENSE.txt for details.
FROM ruby:4.0@sha256:4de17567bc750e8a509fd2181e5c5eda3137bbb635b046943277c90271e4ec1c AS data

ARG UID=1000
ARG GID=1000
ARG UNAME=app
ENV APP_HOME=/app
ENV BUNDLE_PATH=/bundle


#Create the group for the user
RUN if [ x"${GID}" != x"" ] ; \
    then groupadd ${UNAME} -g ${GID} -o ; \
    else groupadd ${UNAME} ; \
    fi

#Create the User and assign ${APP_HOME} as its home directory
RUN if [ x"${UID}" != x"" ] ; \
    then  useradd -m -d ${APP_HOME} -u ${UID} -o -g ${UNAME} -s /bin/bash ${UNAME} ; \
    else useradd -m -d ${APP_HOME} -g ${UNAME} -s /bin/bash ${UNAME} ; \
    fi

RUN mkdir -p ${BUNDLE_PATH} ${APP_HOME}

RUN apt-get update \
 && apt-get upgrade -y \
 && rm -rf /var/lib/apt/lists/*

WORKDIR ${APP_HOME}
COPY --chown=${UNAME}:${UNAME} Gemfile* ${APP_HOME}/
RUN bundle install
COPY --chown=${UNAME}:${UNAME} . ${APP_HOME}

USER ${UNAME}

CMD ["bin/update"]

FROM httpd:latest@sha256:32e9403360ab2f1047523e72f256527fb9aee68b342abf6ad03f0d629157f3d9 AS base

RUN apt-get update \
 && apt-get upgrade -y \
 && rm -rf /var/lib/apt/lists/*

FROM base AS development

FROM base AS production

COPY ./html/ /usr/local/apache2/htdocs/
