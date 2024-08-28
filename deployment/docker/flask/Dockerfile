FROM python:3.10-alpine
WORKDIR /app

ADD src/resources/requirements.txt /app
ADD src/resources/app.py /app
ADD src/resources/minio_file.txt /app
ADD src/resources/intermediate-ca.crt /app
RUN pip3 install --root-user-action=ignore -r requirements.txt

#COPY . /app

CMD [ "python3", "app.py"]
