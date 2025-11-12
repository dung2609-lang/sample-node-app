pipeline {
    // Chỉ định Agent để chạy. Thay 'windows-agent' bằng label phù hợp với máy Jenkins của bạn.
    agent { label 'windows-agent' } 

    // Các biến môi trường
    environment {
        // Cần cấu hình SonarQube Scanner Tool trong Jenkins Global Tool Configuration
        SONAR_SCANNER_HOME = tool 'SonarQubeScanner' 
        SONAR_URL = 'http://your-sonarqube-server:9000' // Thay thế URL thực tế

        // Tên dự án SonarQube. Đổi 'sample-node-app' thành tên dự án của bạn
        SONAR_PROJECT_KEY = 'sample-node-app' 
        
        // Tên image Docker
        DOCKER_IMAGE = "registry-url/your-repo/sample-node-app:${BUILD_ID}"
    }

    stages {
        
        // --- 1. SCM & BUILD ---
        stage('Source & Build') {
            steps {
                echo 'Checking out source code...'
                checkout scm
                
                // Cài đặt các thư viện Node.js
                bat 'npm install' 
                
                // Nếu dự án của bạn có bước build/bundle (ví dụ: webpack/babel), bạn sẽ thêm lệnh đó tại đây
                // bat 'npm run build' 
            }
        }
        
        // --- 2. SCA (Dependency-Check) ---
        stage('Dependency Check (SCA)') {
            steps {
                echo 'Running OWASP Dependency-Check for known vulnerabilities...'
                // Dùng scan type phù hợp. 'npm' quét dependencies của Node.js
                // **LỖI ĐÃ ĐƯỢC SỬA**: Chỉ gọi dependencyCheck() hoặc truyền additionalArguments hợp lệ.
                dependencyCheck scanType: 'NPM', additionalArguments: '--project "NodeApp"'
            }
            post {
                always {
                    // Xuất bản báo cáo Dependency-Check
                    dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                }
            }
        }
        
        // --- 3. SAST (SonarQube) ---
        stage('Static Analysis (SAST)') {
            steps {
                echo 'Running SonarQube Static Analysis...'
                // 'My SonarQube Server' phải khớp với tên cấu hình trong Jenkins -> Configure System
                withSonarQubeEnv('My SonarQube Server') { 
                    // Lệnh chạy SonarScanner. properties file sẽ được tự động tìm kiếm hoặc bạn có thể chỉ định
                    bat "${SONAR_SCANNER_HOME}\\bin\\sonar-scanner.bat -Dsonar.projectKey=${SONAR_PROJECT_KEY} -Dsonar.sources=."
                }
            }
        }
        
        // --- 4. Quality Gate & Package ---
        stage('Quality Gate & Docker Build') {
            steps {
                echo 'Waiting for SonarQube Quality Gate result...'
                // Chờ SonarQube trả về kết quả. Nếu Quality Gate thất bại, pipeline sẽ dừng.
                timeout(time: 15, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
                
                echo 'Building Docker Image...'
                // Đóng gói ứng dụng vào Docker Image
                // Lệnh Windows (bat) cho Docker
                bat "docker build -t ${DOCKER_IMAGE} ." 
                
                echo 'Pushing Docker Image to Registry...'
                bat "docker push ${DOCKER_IMAGE}"
            }
        }
        
        // --- 5. DAST & Deploy to Test ---
        stage('Deploy to Test & DAST') {
            steps {
                echo 'Deploying application to temporary test environment (Port 8080)...'
                // Chạy ứng dụng bằng Docker (ví dụ đơn giản)
                bat "docker run -d --name test-app-$$ -p 8080:3000 ${DOCKER_IMAGE}" // Giả sử Node app chạy ở port 3000
                
                echo 'Running OWASP ZAP (DAST) Scan...'
                // Đây là ví dụ giả định. Bạn cần cấu hình ZAP CLI hoặc ZAP Jenkins Plugin tại đây.
                // Thường sẽ là một lệnh 'bat' gọi ZAP để quét http://localhost:8080.
                bat 'echo "Execute ZAP Scan against http://localhost:8080 here"' 
                
                echo 'Cleaning up test container...'
                bat 'docker rm -f test-app-$$'
            }
        }

        // --- 6. Final Deployment ---
        stage('Deploy to Prod') {
            when {
                // Chỉ chạy khi stage trước đó thành công
                expression { return currentBuild.result == 'SUCCESS' }
            }
            steps {
                echo 'Deploying to Production Environment...'
                // Các lệnh triển khai Production thực tế của bạn
            }
        }
    }
}
