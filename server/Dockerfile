FROM python:3.9

RUN mkdir -p /code \
  && useradd --create-home --uid 1000 --user-group app \
  && chown --recursive app:app /home/app \
  && chown --recursive app:app /code

USER app

ENV PATH /home/app/.local/bin:$PATH
ENV PYTHONUNBUFFERED 1

WORKDIR /code

RUN pip install --upgrade --user pip setuptools pip-tools
COPY requirements.txt /code/
RUN pip install --user -r requirements.txt

COPY app.py /code/
COPY models.py /code/


ENTRYPOINT flask run -h 0.0.0.0 -p 8000