#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>   

// ====== WiFi Credentials ======
const char* ssid = "ADD_YOUR_WIFI_SSID";
const char* password = "ADD_YOUR_WIFI_PASSWORD";


// ====== Pin Definitions ======
int servoPin = 13;
int buzzerPin = 12;
int redLedPin = 14;
int greenLedPin = 27;
int irSensorPin = 26;  

// ====== Global Variables ======
Servo myServo;
int servoPos = 0;     // 0 = closed, 90 = open
WebServer server(80);

// ====== HTML Page ======
String htmlPage = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <title>Locker Control</title>
  <style>
    body { font-family: Arial; text-align: center; margin-top: 50px; }
    button { font-size: 24px; padding: 15px 30px; margin: 20px; border-radius: 12px; }
  </style>
</head>
<body>
  <h1>ESP32 Smart Locker</h1>
  <button onclick="location.href='/open'">Open</button>
  <button onclick="location.href='/close'">Close</button>
  <button onclick="location.href='/status'">Check Status</button>
</body>
</html>
)rawliteral";

// ====== Helper Functions ======
void beep(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(buzzerPin, HIGH);
    delay(150);
    digitalWrite(buzzerPin, LOW);
    delay(150);
  }
}

void blinkLed(int pin, int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(200);
    digitalWrite(pin, LOW);
    delay(200);
  }
}

// ====== Web Routes ======
void handleRoot() {
  server.send(200, "text/html", htmlPage);
}

void handleOpen() {
  Serial.println("Opening locker...");
  myServo.write(90);
  servoPos = 90;

  // Feedback
  beep(2);
  blinkLed(greenLedPin, 3);
  digitalWrite(redLedPin, LOW);  // turn off red LED when open

  server.send(200, "text/html", "<h2>Locker Opened</h2><a href='/'>Back</a>");
}

void handleClose() {
  Serial.println("Closing locker...");
  myServo.write(0);
  servoPos = 0;

  // Feedback
  beep(3);
  blinkLed(redLedPin, 3);
  digitalWrite(redLedPin, HIGH);  // keep red LED ON when closed

  server.send(200, "text/html", "<h2>Locker Closed</h2><a href='/'>Back</a>");
}

void handleStatus() {
  int irValue = digitalRead(irSensorPin);
  String lockerStatus = (servoPos == 0) ? "Closed" : "Open";
  String contentStatus = (irValue == HIGH) ? "Empty" : "Occupied";

  String html = "<h2>Locker Status</h2>";
  html += "<p><b>Locker:</b> " + lockerStatus + "</p>";
  html += "<p><b>Content:</b> " + contentStatus + "</p>";
  html += "<a href='/'>Back</a>";

  server.send(200, "text/html", html);
}

// ====== Setup ======
void setup() {
  Serial.begin(115200);

  pinMode(buzzerPin, OUTPUT);
  pinMode(redLedPin, OUTPUT);
  pinMode(greenLedPin, OUTPUT);
  pinMode(irSensorPin, INPUT);

  // Default state: locker closed, red LED ON
  digitalWrite(redLedPin, HIGH);
  digitalWrite(greenLedPin, LOW);
  digitalWrite(buzzerPin, LOW);

  // Connect WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  // Servo setup
  myServo.attach(servoPin);
  myServo.write(0); // start closed

  // Server routes
  server.on("/", handleRoot);
  server.on("/open", handleOpen);
  server.on("/close", handleClose);
  server.on("/status", handleStatus);

  server.begin();
  Serial.println("Web server started!");
}

// ====== Main Loop ======
void loop() {
  server.handleClient();
}
