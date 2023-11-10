FROM python:3.10

ARG name="admin"

RUN apt update \
 && apt upgrade -y \
 && apt -y install \
       sudo curl git \
 && useradd -r -m ${name} \
 && usermod -u 1000 ${name} \
 && gpasswd -a ${name} sudo \
 && sed -i -Ee "s/(sudo\s+ALL=\(ALL:ALL\)) ALL/\1 NOPASSWD:ALL /g" /etc/sudoers

USER ${name}
WORKDIR /home/${name}

COPY --chown=${name}:${name} ./tmp/src /home/${name}/src

RUN curl -sSL https://install.python-poetry.org | python3 - \
&& . /home/${name}/.profile \
&& cd /home/${name}/src \
&& poetry install \
&& echo ". /home/${name}/.profile && cd /home/${name}/src && poetry run python3 ygo_heroku.py" >> /home/${name}/script_start.sh