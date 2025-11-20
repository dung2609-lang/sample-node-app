pipeline {
    agent any

    tools {
        // Tên này khớp với hình image_3ab10a.png
        nodejs 'node18' 
    }

    environment {
        // Cấu hình App
        IMAGE_NAME = "devsecops-demo:latest"
        CONTAINER_NAME = "sample-node-container"
        APP_PORT = "3000"
        
        // --- CẤU HÌNH TÊN TOOL (KHỚP VỚI ẢNH BẠN GỬI) ---
        
        // Khớp với hình image_3ab0e7.png
        SCANNER_TOOL = 'SonarQubeScanner' 
        
        // Khớp với hình image_3ab143.png
        DEP_CHECK_TOOL = 'depcheck'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Khớp với hình image_3aadfe.png
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
                // Gọi tool theo tên biến đã khai báo ở trên
                dependencyCheck additionalArguments: '--format HTML --format XML', odcInstallation: DEP_CHECK_TOOL
            }
        }

        stage('SAST: SonarQube Scan') {
            steps {
                script {
                    echo '--- Scanning Code Quality ---'
                    def scannerHome = tool SCANNER_TOOL
                    
                    // Tên trong ngoặc khớp với hình image_3aae22.png (Server Config)
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
                    bat "if not exist zap_report mkdir zap_report"
                    
                    // Chạy ZAP Docker để quét website
                    bat """
                        docker run --rm -v %WORKSPACE%/zap_report:/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py ^
                        -t http://host.docker.internal:${APP_PORT} ^
                        -r zap_report.html ^
                        -I
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
