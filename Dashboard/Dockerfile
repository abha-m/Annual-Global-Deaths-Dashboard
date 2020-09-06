FROM nginx

WORKDIR /app

COPY requirements.txt ./
RUN apt-get update
RUN apt-get install -y python3 \
python3-pip

RUN pip3 install -r requirements.txt
COPY ./ ./

CMD ["python3", "app.py"]