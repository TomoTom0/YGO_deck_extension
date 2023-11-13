FROM python:3.10

ARG name="admin"

RUN apt update \
 && apt upgrade -y \
 && apt -y install \
       sudo curl git \
 && useradd -r -m ${name} \
 && usermod -u 1000 ${name} \
 && gpasswd -a ${name} sudo \
 && sed -i -Ee "s/(sudo\s+ALL=\(ALL:ALL\)) ALL/\1 NOPASSWD:ALL /g" /etc/sudoers \
 && mkdir -p /opt \
 && chown -R ${name}:${name} /opt


COPY --chown=${name}:${name} . /opt/workdir/
USER ${name}
WORKDIR /opt/workdir

RUN curl -sSL https://install.python-poetry.org | python3 - \
&& . /home/${name}/.profile \
&& cd /opt/workdir \
&& poetry install \
&& echo ". /home/${name}/.profile && cd /opt/workdir && poetry run python3 ygo_db_update/ygo_db_update.py" >> /opt/workdir/script_start.sh