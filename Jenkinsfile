pipeline {
    // Chỉ định Agent để chạy. Nếu bạn chạy ngay trên máy Jenkins Windows, dùng 'master'
    // Hoặc dùng một label của Agent Windows bạn đã cấu hình (ví dụ: 'windows-agent')
    agent { label 'master' } 

    // Các biến môi trường chung
    environment {
        // Thay đổi URL và Token này cho phù hợp với SonarQube Server của bạn
        SONAR_SCANNER_HOME = tool 'SonarQubeScanner' // Phải cấu hình trong Jenkins Global Tool Configuration
        SONAR_URL = 'http://localhost:9000'
        
        // Tên image và tag của ứng dụng
        DOCKER_IMAGE = "my-app-image:${BUILD_ID}"
    }

    stages {
        // --- 1. SCM & BUILD ---
        stage('Source & Build') {
            steps {
                // Kéo mã nguồn
                checkout scm
                
                // Giả sử đây là ứng dụng Maven
                bat 'mvn clean package' // Hoặc các lệnh build tương ứng với ngôn ngữ của bạn
            }
        }
        
        // --- 2. SAST (SonarQube) ---
        stage('Static Analysis (SAST)') {
            steps {
                // SonarQube Analysis
                withSonarQubeEnv('My SonarQube Server') { // Thay 'My SonarQube Server' bằng tên cấu hình trong Jenkins
                    bat "${SONAR_SCANNER_HOME}\\bin\\sonar-scanner.bat -Dsonar.projectKey=MyProject -Dsonar.sources=."
                }
            }
        }
        
        // --- 3. SCA (Dependency-Check) ---
        stage('Dependency Check (SCA)') {
            steps {
                // Quét lỗ hổng thư viện (sử dụng plugin)
                dependencyCheck additionalArguments: '--scan ./target', skipPublishing: true
            }
            // Thêm một bước post để publish báo cáo Dependency-Check sau khi hoàn tất stage
            post {
                always {
                    dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                }
            }
        }
        
        // --- 4. Quality Gate & Package ---
        stage('Quality Gate & Docker Build') {
            steps {
                // Chờ SonarQube kiểm tra kết quả (quan trọng)
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
                
                // Đóng gói ứng dụng vào Docker Image
                bat "docker build -t ${DOCKER_IMAGE} ." 
            }
        }
        
        // --- 5. DAST & DEPLOY ---
        stage('Deploy to Test & DAST') {
            steps {
                echo 'Triển khai lên môi trường Test...'
                // Ví dụ: Triển khai Docker Container lên localhost hoặc máy chủ Test
                bat "docker run -d --name test-app -p 8080:8080 ${DOCKER_IMAGE}"
                
                echo 'Chạy OWASP ZAP (DAST)...'
                // Ở đây bạn cần chạy ZAP theo kiểu CLI hoặc gọi API của ZAP.
                // Đây là một ví dụ giả lập, việc tích hợp ZAP thực tế phức tạp hơn.
                bat 'echo "Running OWASP ZAP Scan against http://localhost:8080"'
                
                // Dọn dẹp
                bat 'docker rm -f test-app'
            }
        }

        // --- 6. Final Deployment ---
        stage('Deploy to Staging/Prod') {
            steps {
                // Triển khai lên môi trường Production nếu tất cả các bước trên thành công
                echo 'Deploying to Production...'
                // Thêm các lệnh deploy production thực tế tại đây
            }
        }
    }
}
