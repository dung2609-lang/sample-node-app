pipeline {
    agent any

    tools {
        nodejs 'node18' 
    }

    environment {
        // Cấu hình App
        IMAGE_NAME = "devsecops-demo:latest"
        CONTAINER_NAME = "sample-node-container"
        APP_PORT = "3000"
        SCANNER_TOOL = 'SonarQubeScanner' 
        DEP_CHECK_TOOL = 'depcheck'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/dung2609-lang/sample-node-app.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo '--- Building Docker Image ---'
                    bat "docker build -t ${IMAGE_NAME} ."
                }
            }
        }

        stage('SCA: Dependency Check') {
            steps {
                echo '--- Scanning Library Vulnerabilities ---'
                dependencyCheck additionalArguments: '--format HTML --format XML', odcInstallation: DEP_CHECK_TOOL
            }
        }

        stage('SAST: SonarQube Scan') {
            steps {
                script {
                    echo '--- Scanning Code Quality ---'
                    def scannerHome = tool SCANNER_TOOL
                    withSonarQubeEnv('SonarQube') { 
                        bat """
                            "${scannerHome}/bin/sonar-scanner" ^
                            -Dsonar.projectKey=devsecops-demo ^
                            -Dsonar.sources=. ^
                            -Dsonar.host.url=http://localhost:9000
                        """
                    }
                }
            }
        }

        stage('Deploy App') {
            steps {
                script {
                    echo '--- Deploying Application ---'
                    // Xóa container cũ nếu tồn tại
                    bat "docker rm -f ${CONTAINER_NAME} || exit 0"
                    // Chạy container mới
                    bat "docker run -d --name ${CONTAINER_NAME} -p ${APP_PORT}:3000 ${IMAGE_NAME}"
                    sleep 10
                }
            }
        }

      stage('DAST: OWASP ZAP') {
            steps {
                script {
                    echo '--- Starting ZAP Scan ---'
                    // Tạo thư mục report
                    bat "if not exist zap_report mkdir zap_report"
                    bat """
                        docker run --rm -u 0 -v "%WORKSPACE%\\zap_report":/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py -t http://host.docker.internal:${APP_PORT} -r zap_report.html -I
                    """
                }
            }
        }
    }

    post {
        always {
            // Hiển thị báo cáo
            publishHTML (target: [
                allowMissing: false,
                alwaysLinkToLastBuild: false,
                keepAll: true,
                reportDir: 'zap_report',
                reportFiles: 'zap_report.html',
                reportName: 'OWASP ZAP Report'
            ])
            dependencyCheckPublisher pattern: 'dependency-check-report.xml'
        }
    }
}
