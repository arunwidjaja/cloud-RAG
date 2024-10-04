# For running on AWS Lambda
FROM public.ecr.aws/lambda/python:3.12

ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

WORKDIR /app

COPY requirements.txt ${LAMBDA_TASK_ROOT}
COPY app/. ${LAMBDA_TASK_ROOT}

RUN pip install --no-cache-dir --upgrade -r requirements.txt

CMD ["api_handler.handler"]

EXPOSE 8000

#################################################################################

# For running locally
# FROM python:3.12

# ARG OPENAI_API_KEY
# ENV OPENAI_API_KEY=${OPENAI_API_KEY}

# WORKDIR /app

# COPY requirements.txt .

# RUN pip install --no-cache-dir --upgrade -r requirements.txt

# COPY app/. .

# CMD ["uvicorn", "api_handler:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# EXPOSE 8000