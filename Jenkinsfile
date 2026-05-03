pipeline {
    agent any

    environment {
        REGISTRY        = "registry.hub.docker.com"
        BACKEND_IMAGE   = "YOUR_DOCKERHUB_USERNAME/eldenring-backend"
        FRONTEND_IMAGE  = "YOUR_DOCKERHUB_USERNAME/eldenring-frontend"
        IMAGE_TAG       = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
        KUBECONFIG_CRED = "kubeconfig-prod"           // Jenkins credential ID
        REGISTRY_CRED   = "registry-credentials"      // Jenkins credential ID
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Building branch: ${env.BRANCH_NAME} @ ${env.GIT_COMMIT?.take(7)}"
            }
        }

        stage('Test — Backend') {
            agent {
                docker {
                    image 'python:3.12-slim'
                    args  '--user root'
                }
            }
            steps {
                dir('backend') {
                    sh '''
                        pip install -q -r requirements.txt pytest pytest-cov
                        pytest tests/ -v --tb=short --junitxml=test-results.xml \
                               --cov=app --cov-report=xml:coverage.xml
                    '''
                }
            }
            post {
                always {
                    junit        'backend/test-results.xml'
                    publishHTML([
                        reportDir:   'backend',
                        reportFiles: 'coverage.xml',
                        reportName:  'Backend Coverage',
                    ])
                }
            }
        }

        stage('Test — Frontend') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args  '--user root'
                }
            }
            steps {
                dir('frontend') {
                    sh '''
                        npm ci --legacy-peer-deps
                        npm test -- --watchAll=false --ci --passWithNoTests
                    '''
                }
            }
        }

        stage('Build & Push Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'release/*'
                }
            }
            steps {
                script {
                    docker.withRegistry("https://${REGISTRY}", REGISTRY_CRED) {
                        def backendImg  = docker.build("${BACKEND_IMAGE}:${IMAGE_TAG}",  "-f backend/dockerfile  backend")
                        def frontendImg = docker.build("${FRONTEND_IMAGE}:${IMAGE_TAG}", "-f frontend/dockerfile frontend")

                        backendImg.push()
                        backendImg.push('latest')
                        frontendImg.push()
                        frontendImg.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when { branch 'main' }
            steps {
                withCredentials([file(credentialsId: KUBECONFIG_CRED, variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl set image deployment/eldenring-backend  \
                            backend=${BACKEND_IMAGE}:${IMAGE_TAG}       \
                            -n eldenring --record

                        kubectl set image deployment/eldenring-frontend \
                            frontend=${FRONTEND_IMAGE}:${IMAGE_TAG}     \
                            -n eldenring --record

                        kubectl rollout status deployment/eldenring-backend  -n eldenring --timeout=120s
                        kubectl rollout status deployment/eldenring-frontend -n eldenring --timeout=120s
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded — image tag: ${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline failed. Check logs above."
        }
        always {
            cleanWs()
        }
    }
}
