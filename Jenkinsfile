// Jenkinsfile - located in the root of your Git repository

pipeline {
    agent any // Tells Jenkins to run this pipeline on any available agent

    environment {
        // Retrieve ACR login credentials securely from Jenkins's built-in credential management
        // The IDs 'jenkins-acr-username' and 'jenkins-acr-password' must match the IDs you just created in Jenkins
        ACR_USERNAME = credentials('jenkins-acr-username')
        ACR_PASSWORD = credentials('jenkins-acr-password')
        ACR_LOGIN_SERVER = 'devops77.azurecr.io' // <<< MAKE SURE THIS IS YOUR CORRECT ACR LOGIN SERVER

        // Define image name and tag for versioning
        IMAGE_NAME = "todo-app"
        // Using BUILD_NUMBER ensures each build gets a unique tag
        IMAGE_TAG = "build-${BUILD_NUMBER}" 
        FULL_IMAGE_NAME = "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                // This step pulls your code from Git based on the SCM configuration in Jenkins job
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Execute docker build command.
                    // The '.' means Dockerfile is in the current directory (which is the repo root after checkout)
                    sh "docker build -t ${FULL_IMAGE_NAME} ."
                    echo "Docker image built: ${FULL_IMAGE_NAME}"
                }
            }
        }

        stage('Push Docker Image to ACR') {
            steps {
                script {
                    // Authenticate with ACR using the Service Principal credentials
                    sh "docker login ${ACR_LOGIN_SERVER} -u ${ACR_USERNAME} -p ${ACR_PASSWORD}"
                    // Push the newly built image
                    sh "docker push ${FULL_IMAGE_NAME}"
                    echo "Docker image pushed to ACR: ${FULL_IMAGE_NAME}"
                    // Logout from Docker registry (good practice for security)
                    sh "docker logout ${ACR_LOGIN_SERVER}"
                }
            }
        }
    }
}