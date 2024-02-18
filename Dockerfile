FROM python:3.11-slim

# upgrade pip
RUN pip install --upgrade pip

# permissions and nonroot user for tightened security
RUN adduser --disabled-password --comment "" flask
RUN mkdir /home/app/ && chown -R flask:flask /home/app
WORKDIR /home/app
USER flask

# copy all the files to the container
COPY --chown=flask:flask . .

# venv
ENV VIRTUAL_ENV=/home/app/venv

# python setup
RUN python -m venv $VIRTUAL_ENV --system-site-packages
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
RUN pip install -r requirements.txt

# define the port number the container should expose
EXPOSE 5000
ENV PYTHONUNBUFFERED 1

CMD ["gunicorn", "-w 4 --bind 0.0.0.0:5000 wsgi:app"]
