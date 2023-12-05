# Use an official lightweight Python image.
FROM python:3.9

# Set the working directory in the docker image.
WORKDIR /app
RUN curl -sSL https://sdk.cloud.google.com | bash
# Copy over the requirements file.
COPY requirements.txt .

# Install dependencies.

#Upgrade Pip
RUN pip3 install --upgrade pip

RUN pip3 install --prefer-binary --no-cache-dir --upgrade -r requirements.txt


# Copy over the rest of the application code.
COPY . .

# Specify the command to run on container start.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
