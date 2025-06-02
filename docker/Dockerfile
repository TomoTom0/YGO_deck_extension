FROM python:3.12

ARG name="admin"

RUN apt update \
 && apt upgrade -y \
 && apt -y install \
       sudo curl git \
 && useradd -r -m ${name} \
 && usermod -u 1000 ${name} \
 && gpasswd -a ${name} sudo \
 && sed -i -Ee "s/(sudo\s+ALL=\(ALL:ALL\)) ALL/\1 NOPASSWD:ALL /g" /etc/sudoers \
 && mkdir -p /opt/workdir \
 && chown -R ${name}:${name} /opt/workdir \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

USER ${name}
ENV RYE_HOME="/home/${name}/.rye"
ENV PATH="/home/${name}/.rye/shims:${PATH}"
WORKDIR /home/${name}
RUN curl -sSf https://rye-up.com/get | RYE_INSTALL_OPTION="--yes" bash \
    && echo ". ${RYE_HOME}/env" >> /home/${name}/.bashrc # オプション: bashログイン時にRye環

WORKDIR /opt/workdir
COPY --chown=${name}:${name} pyproject.toml rye.lock* ./

RUN rye sync --no-dev

COPY --chown=${name}:${name} . /opt/workdir/

RUN echo "#!/bin/bash" > /opt/workdir/script_start.sh \
 && echo "set -e" >> /opt/workdir/script_start.sh \
 && echo "cd /opt/workdir" >> /opt/workdir/script_start.sh \
 && echo "rye run python src/ygo_db_update/ygo_db_update.py" >> /opt/workdir/script_start.sh \
 && chmod +x /opt/workdir/script_start.sh

# RUN curl -sSL https://install.python-poetry.org | python3 - \
# && . /home/${name}/.profile \
# && cd /opt/workdir \
# && poetry lock --no-update \
# && poetry install \
# && echo ". /home/${name}/.profile && cd /opt/workdir && poetry run python3 ygo_db_update/ygo_db_update.py" >> /opt/workdir/script_start.sh