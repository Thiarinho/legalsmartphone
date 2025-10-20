pipeline {
    agent any

    tools { nodejs "NodeJS_16" }

    environment {
        DOCKER_HUB_USER = 'thierno784'
        FRONT_IMAGE     = 'react-frontend'
        BACK_IMAGE      = 'express-backend'
        KUBECONFIG      = '/var/lib/jenkins/.kube/config'
        FRONT_URL       = 'http://frontend.local'
        BACK_URL        = 'http://backend.local'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Thiarinho/legalsmartphone.git'
            }
        }

        stage('Install dependencies') {
            parallel {
                stage('Backend') {
                    steps { dir('statefull-app/full_stack_app/backend') { sh 'npm install' } }
                }
                stage('Frontend') {
                    steps { dir('statefull-app/full_stack_app/frontend') { sh 'npm install' } }
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    sh 'cd statefull-app/full_stack_app/back-end && npm test || echo "Aucun test backend"'
                    sh 'cd statefull-app/full_stack_app/front-end && npm test || echo "Aucun test frontend"'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh "docker build -t $DOCKER_HUB_USER/$FRONT_IMAGE:latest statefull-app/full_stack_app/front-end"
                    sh "docker build -t $DOCKER_HUB_USER/$BACK_IMAGE:latest statefull-app/full_stack_app/back-end"
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'TIM-docker', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push $DOCKER_USER/react-frontend:latest
                        docker push $DOCKER_USER/express-backend:latest
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes with Ingress') {
            steps {
                dir('statefull-app/full_stack_app') {
                    script {
                        // MongoDB
                        sh 'kubectl apply -f k8s/mongo-deployment.yaml'
                        sh 'kubectl apply -f k8s/mongo-service.yaml'
                        sh 'kubectl rollout status deployment/mongo'

                        // Backend
                        sh 'kubectl apply -f k8s/back-deployment.yaml'
                        sh 'kubectl apply -f k8s/back-service.yaml'
                        sh 'kubectl rollout status deployment/backend'

                        // Frontend
                        sh 'kubectl apply -f k8s/front-deployment.yaml'
                        sh 'kubectl apply -f k8s/front-service.yaml'
                        sh 'kubectl rollout status deployment/frontend'

                        // Ingress
                        sh 'kubectl apply -f k8s/app-ingress.yaml'
                    }
                }
            }
        }

        stage('Smoke Test') {
            steps {
                script {
                    sh "curl -f $FRONT_URL || echo 'Frontend unreachable'"
                    sh "curl -f $BACK_URL/api || echo 'Backend unreachable'"
                }
            }
        }
    }

    post {
        success {
            emailext(
                subject: "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline réussi\nFrontend: ${env.FRONT_URL}\nBackend: ${env.BACK_URL}\nDétails: ${env.BUILD_URL}",
                to: "thiernomane932@gmail.com"
            )
        }
        failure {
            emailext(
                subject: "Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Le pipeline a échoué\nDétails: ${env.BUILD_URL}",
                to: "thiernomane932@gmail.com"
            )
        }
    }
}
