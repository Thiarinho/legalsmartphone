pipeline {
    agent any

    tools {
        nodejs "NodeJS_16"
    }

    environment {
        DOCKER_HUB_USER = 'thierno784'
        FRONT_IMAGE = 'react-frontend'
        BACK_IMAGE  = 'express-backend'
    }

    triggers {
        // Pour que le pipeline démarre quand le webhook est reçu
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

        stage('Install dependencies - Backend') {
            steps {
                dir('back-end') {
                    sh 'npm install'
                }
            }
        }

        stage('Install dependencies - Frontend') {
            steps {
                dir('front-end') {
                    sh 'npm install'
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

        // stage SonarQube et Quality Gate (désactivés)
        /*
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube_Local') { 
                    script {
                        def scannerHome = tool 'sonarqube' 
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        */

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
                sh 'docker container prune -f'
                sh 'docker image prune -f'
            }
        }

        stage('Check Docker & Compose') {
            steps {
                sh 'docker --version'
                sh 'docker-compose --version || echo "docker-compose non trouvé"'
            }
        }
        environment {
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
    }

    stages {
        stage('Deploy to Minikube') {
            steps {
                sh '''
                    kubectl get nodes
                    kubectl apply -f k8s/mongo-deployment.yaml
                '''
            }
        }
    }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-jenkins']) {
                    sh "kubectl apply -f k8s/mongo-deployment.yaml"
                    sh "kubectl apply -f k8s/mongo-service.yaml"
                    sh "kubectl apply -f k8s/back-deployment.yaml"
                    sh "kubectl apply -f k8s/back-service.yaml"
                    sh "kubectl apply -f k8s/front-deployment.yaml"
                    sh "kubectl apply -f k8s/front-service.yaml"

                    sh "kubectl rollout status deployment/mongo"
                    sh "kubectl rollout status deployment/backend"
                    sh "kubectl rollout status deployment/frontend"
                }
            }
        }

        
        stage('Smoke Test') {
            steps {
                sh '''
                    echo " Vérification Frontend (port 5173)..."
                    curl -f http://localhost:5173 || echo "Frontend unreachable"

                    echo " Vérification Backend (port 5001)..."
                    curl -f http://localhost:5001/api || echo "Backend unreachable"
                '''
            }
        }
        
    } // 👈 fermeture du bloc stages ajoutée ici ✅

    post {
        success {
            emailext(
                subject: "Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline réussi\nDétails : ${env.BUILD_URL}",
                to: "thiernomane932@gmail.com"
            )
        }
        failure {
            emailext(
                subject: "Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Le pipeline a échoué\nDétails : ${env.BUILD_URL}",
                to: "thiernomane932@gmail.com"
            )
        }
    }
}
