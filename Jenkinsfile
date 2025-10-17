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
        //* Étape du pipeline dédiée à l'analyse SonarQube
        /*stage('SonarQube Analysis') {
            steps {
                // Active l'environnement SonarQube configuré dans Jenkins
                // "SonarQube_Local" est le nom que tu as défini dans "Manage Jenkins > Configure System"
                withSonarQubeEnv('SonarQube_Local') { 
                    script {
                        // Récupère le chemin du sonarqube installé via "Global Tool Configuration"
                        def scannerHome = tool 'sonarqube' 
                        
                        // Exécute la commande sonar-scanner pour analyser le code
                        // Le scanner envoie les résultats au serveur SonarQube
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }*/

        // Étape du pipeline qui vérifie le Quality Gate
       /* stage('Quality Gate') {
            steps {
                // Définit un délai maximum de 3 minutes pour attendre la réponse de SonarQube
                timeout(time: 2, unit: 'MINUTES') {
                    // Attend le résultat du Quality Gate (succès ou échec)
                    // Si le Quality Gate échoue, le pipeline est automatiquement interrompu (abortPipeline: true)
                    waitForQualityGate abortPipeline: true
                }
            }
        }*/

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

        // on supprime les conteneur inactif dans docker container
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

        /*stage('Deploy (compose.yaml)') {
            steps {
                dir('.') {  
                    sh 'docker compose -f compose.yaml down || true'
                    sh 'docker compose -f compose.yaml pull'
                    sh 'docker compose -f compose.yaml up -d'
                    sh 'docker compose -f compose.yaml ps'
                    sh 'docker compose -f compose.yaml logs --tail=50'
                }
            }
        }*/
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'TIM-kube']) {
                    // Déployer MongoDB
                    sh "kubectl apply -f k8s/mongo-deployment.yaml"
                    sh "kubectl apply -f k8s/mongo-service.yaml"

                    // Déployer backend
                    sh "kubectl apply -f k8s/back-deployment.yaml"
                    sh "kubectl apply -f k8s/back-service.yaml"

                    // Déployer frontend
                    sh "kubectl apply -f k8s/front-deployment.yaml"
                    sh "kubectl apply -f k8s/front-service.yaml"

                    // Vérifier que les pods sont Running
                    sh "kubectl rollout status deployment/mongo"
                    sh "kubectl rollout status deployment/backend"
                    sh "kubectl rollout status deployment/frontend"
                }
            }
        }

        /*stage('Smoke Test') {
            steps {
                sh '''
                    echo " Vérification Frontend (port 5173)..."
                    curl -f http://localhost:5173 || echo "Frontend unreachable"

                    echo " Vérification Backend (port 5001)..."
                    curl -f http://localhost:5001/api || echo "Backend unreachable"
                '''
            }
        }*/
    

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
