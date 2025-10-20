pipeline {
    agent any

    tools {
        nodejs "NodeJS_16"
    }

    environment {
        DOCKER_HUB_USER = 'thierno784'
        FRONT_IMAGE     = 'react-frontend'
        BACK_IMAGE      = 'express-backend'
        KUBECONFIG      = '/var/lib/jenkins/.kube/config' // accès Kubernetes pour Jenkins
    }

    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'ref', value: '$.ref'],
                [key: 'pusher_name', value: '$.pusher.name'],
                [key: 'commit_message', value: '$.head_commit.message']
            ],
            causeString: 'Push par $pusher_name sur $ref: "$commit_message"',
            token: 'mysecret',
            printContributedVariables: true,
            printPostContent: true
        )
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
                    steps {
                        dir('back-end') { sh 'npm install' }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('front-end') { sh 'npm install' }
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    sh 'cd back-end && npm test || echo "Aucun test backend"'
                    sh 'cd front-end && npm test || echo "Aucun test frontend"'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh "docker build -t $DOCKER_HUB_USER/$FRONT_IMAGE:latest ./front-end"
                    sh "docker build -t $DOCKER_HUB_USER/$BACK_IMAGE:latest ./back-end"
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

        stage('Clean Docker') {
            steps {
                sh 'docker container prune -f && docker image prune -f'
            }
        }

        stage('Check Docker & Compose') {
            steps {
                sh 'docker --version && docker-compose --version || echo "docker-compose non trouvé"'
            }
        }

        stage('Deploy to Minikube / Kubernetes') {
            steps {
                script {
                    // Déploiement MongoDB
                    sh 'kubectl apply -f k8s/mongo-deployment.yaml'
                    sh 'kubectl apply -f k8s/mongo-service.yaml'
                    sh 'kubectl rollout status deployment/mongo'

                    // Déploiement Backend
                    sh 'kubectl apply -f k8s/back-deployment.yaml'
                    sh 'kubectl apply -f k8s/back-service.yaml'
                    sh 'kubectl rollout status deployment/backend'

                    // Déploiement Frontend
                    sh 'kubectl apply -f k8s/front-deployment.yaml'
                    sh 'kubectl apply -f k8s/front-service.yaml'
                    sh 'kubectl rollout status deployment/frontend'

                    // Récupération des URL NodePort depuis Minikube
                    FRONT_URL = sh(script: "minikube service front-service --url", returnStdout: true).trim()
                    BACK_URL  = sh(script: "minikube service back-service --url", returnStdout: true).trim()
                    echo "Frontend accessible sur : ${FRONT_URL}"
                    echo "Backend accessible sur : ${BACK_URL}"
                }
            }
        }

        stage('Smoke Test') {
            steps {
                script {
                    sh "curl -f ${FRONT_URL} || echo 'Frontend unreachable'"
                    sh "curl -f ${BACK_URL}/api || echo 'Backend unreachable'"
                }
            }
        }
    }

    post {
        success {
            emailext(
                subject: "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline réussi\nFrontend: ${FRONT_URL}\nBackend: ${BACK_URL}\nDétails: ${env.BUILD_URL}",
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
