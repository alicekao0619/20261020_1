// 定義急救題目與答案的資料結構，包含專屬動畫類型
let questions = [
  { id: 1, type: "燙傷", animType: "burn", correctText: "沖、脫、泡、蓋、送", currentX: 0, currentY: 0 },
  { id: 2, type: "扭傷", animType: "sprain", correctText: "保護、休息、冰敷、壓迫、抬高", currentX: 0, currentY: 0 },
  { id: 3, type: "破皮", animType: "scratch", correctText: "生理食鹽水沖洗、塗藥膏、貼OK繃", currentX: 0, currentY: 0 },
  { id: 4, type: "刀傷", animType: "cut", correctText: "直接壓迫止血、消毒、包紮", currentX: 0, currentY: 0 },
  { id: 5, type: "牙齒斷", animType: "tooth", correctText: "保存在冰牛奶或生理食鹽水中送醫", currentX: 0, currentY: 0 },
  { id: 6, type: "肌肉拉傷", animType: "muscle", correctText: "立即停止運動、冰敷並包紮壓迫", currentX: 0, currentY: 0 }
];

// 定義打亂後的選項陣列
let options = [];
// 記錄當前被拖曳選項的索引（-1 表示沒有選中任何東西）
let draggedOptionIndex = -1;
// 拖曳時滑鼠與選項中心的偏移量
let offsetX = 0;
let offsetY = 0;

// 按鈕與遊戲狀態變數
let submitButton; // 交卷按鈕
let isSubmitted = false; // 是否已交卷
let score = 0; // 總得分
let particles = []; // 存放彩帶粒子的陣列

// 動畫計時器（供所有動態人物與場景共享）
let animTimer = 0;

// p5.js 設定函式，只執行一次
function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 設定文字對齊方式為居中
  textAlign(CENTER, CENTER);
  
  // 初始化並隨機打亂「每個」選項的初始位置
  initializeOptions();
  
  // 建立「交卷看成績」按鈕
  submitButton = createButton('交卷看成績');
  // 設定按鈕位置與樣式
  updateButtonPosition();
  submitButton.style('padding', '12px 24px');
  submitButton.style('font-size', '18px');
  submitButton.style('font-weight', 'bold');
  submitButton.style('background-color', '#4CAF50');
  submitButton.style('color', 'white');
  submitButton.style('border', 'none');
  submitButton.style('border-radius', '8px');
  submitButton.style('cursor', 'pointer');
  // 綁定按鈕點擊事件
  submitButton.mousePressed(checkAnswers);
}

// 初始化與重置選項位置的函式
function initializeOptions() {
  // 複製題目文字作為選項
  let originalTexts = questions.map(q => q.correctText);
  // 將選項文字陣列隨機打亂，確保每次進網頁順序都不同
  options = shuffle(originalTexts);
  
  // 計算響應式的選項排列位置（排成兩排，每排3個）
  let colWidth = windowWidth / 3;
  for (let i = 0; i < options.length; i++) {
    let row = floor(i / 3);
    let col = i % 3;
    // 將「每個」選項預設放置在畫面最下方的發送區
    let x = colWidth * col + colWidth / 2;
    let y = windowHeight * 0.76 + row * 65;
    
    // 指定初始座標，此時 questions[i].correctText 用來存儲打亂後的文字選項
    questions[i].correctText = options[i];
    questions[i].currentX = x;
    questions[i].currentY = y;
  }
}

// 當瀏覽器視窗大小改變時自動觸發的響應式函式
function windowResized() {
  // 重新調整畫布大小為全螢幕
  resizeCanvas(windowWidth, windowHeight);
  // 更新交卷按鈕的位置
  updateButtonPosition();
}

// 更新按鈕位置的獨立函式
function updateButtonPosition() {
  submitButton.position(windowWidth / 2 - 65, windowHeight * 0.92);
}

// p5.js 主要繪圖循環，每秒執行約 60 次
function draw() {
  // 清除背景並設定為舒適的淡藍色
  background(230, 245, 255);
  
  // 累加計時器推動動畫前進
  animTimer += 0.05;
  
  // 1. 繪製頂部中央的簡單主動態大圖標
  drawTopBanner();
  
  // 2. 繪製「每個」受傷情境的目標放置區（包含內嵌式幾何小人動畫）
  drawTargetZones();
  
  // 3. 繪製「每個」可拖曳的簡易處理文字選項
  drawDraggableOptions();
  
  // 4. 如果已經交卷，顯示成績面板與全螢幕彩帶
  if (isSubmitted) {
    drawScoreBoard();
    // 如果成績大於等於 60%（答對 4 題以上），持續更新並繪製彩帶特效
    if (score >= 60) {
      updateAndDrawParticles();
    }
  }
}

// 繪製上方橫幅與主動畫的函式
function drawTopBanner() {
  fill(40, 80, 130);
  textSize(28);
  text("🩹 國小安全教育：急救小達人測驗 🚑", windowWidth / 2, 40);
  
  textSize(15);
  fill(80);
  text("👉 請動動滑鼠，將綠色的「處理方法」拖曳到對應的「傷口情境動畫」下方框內吧！ 👈", windowWidth / 2, 75);
}

// 繪製配對目標區（含各題目客製化動畫）的函式
function drawTargetZones() {
  let boxWidth = min(windowWidth / 3 - 40, 350); // 自動適應螢幕寬度
  let animHeight = 75; // 每道題目情境動態的高度
  let colWidth = windowWidth / 3;
  
  rectMode(CENTER);
  for (let i = 0; i < questions.length; i++) {
    let row = floor(i / 3);
    let col = i % 3;
    let x = colWidth * col + colWidth / 2;
    let y = windowHeight * 0.22 + row * 175; // 拉高間距以容納動畫
    
    // --- 繪製題目情境標題外框 ---
    stroke(100, 160, 240);
    strokeWeight(2);
    fill(255);
    rect(x, y, boxWidth, 30, 5);
    
    noStroke();
    fill(30);
    textSize(16);
    text("⚠️ 題目: " + questions[i].type, x, y);
    
    // --- 繪製內嵌式幾何人型情境動態圖 ---
    push();
    translate(x, y + 58); // 定位到動畫畫布中心
    fill(245, 248, 252);
    stroke(200, 220, 240);
    rect(0, 0, boxWidth - 10, animHeight, 8); // 動畫小背景框
    
    // 依據當前題目類型，渲染精細的幾何人型動畫
    drawDetailedHumanAnimation(questions[i].animType, boxWidth - 20, animHeight);
    pop();
    
    // --- 繪製下方的「拖曳放置虛線框」 ---
    let targetBoxY = y + 118;
    stroke(160, 180, 200);
    strokeWeight(2);
    fill(250, 252, 255);
    rect(x, targetBoxY, boxWidth, 42, 8);
    
    // 提示虛線文字
    noStroke();
    fill(140);
    textSize(12);
    text("[ 把正確答案拖到這裡放開 ]", x, targetBoxY);
    
    // 儲存「每個」目標框的中心點
    questions[i].targetX = x;
    questions[i].targetY = targetBoxY;
    questions[i].boxW = boxWidth;
    questions[i].boxH = 42;
  }
}

// 核心繪圖輔助功能：繪製標準的「幾何人型（圓形頭、三角形身體）」
function drawStickFigure(x, y, headColor, bodyColor, isCrying, angle = 0) {
  push();
  translate(x, y);
  rotate(angle);
  noStroke();
  
  // 1. 繪製三角形身體 (以x, y為中心底部)
  fill(bodyColor);
  triangle(0, -22, -12, 0, 12, 0);
  
  // 2. 繪製圓形頭部
  fill(headColor);
  ellipse(0, -28, 14, 14);
  
  // 3. 繪製哭泣淚水動態 (如果是受傷狀態)
  if (isCrying) {
    fill(100, 200, 255);
    let tearY = (animTimer * 10) % 8;
    ellipse(-4, -26 + tearY, 2, 3);
    ellipse(4, -26 + tearY, 2, 3);
  }
  pop();
}

// 核心功能：依據類型繪製生動、幾何人型主角的情境動畫
function drawSituationAnimation(type, w, h) {
  // 此函式已升級為下方的 drawDetailedHumanAnimation
}

function drawDetailedHumanAnimation(type, w, h) {
  noStroke();
  
  if (type === "burn") {
    // 【燙傷情境】：精細熱水壺/火爐 + 小人燙到手
    // 繪製動態火爐與茶壺
    let fireH = 12 + sin(animTimer * 2.5) * 4;
    fill(255, 80, 40); triangle(-35, h/2 - 15, -25, h/2 - 15 - fireH, -15, h/2 - 15);
    fill(255, 180, 50); triangle(-31, h/2 - 15, -25, h/2 - 15 - fireH * 0.7, -19, h/2 - 15);
    fill(120); rect(-25, h/2 - 18, 22, 6, 2); // 爐架
    
    // 繪製幾何小人 (圓頭三角形身)，站在火爐旁手晃動
    drawStickFigure(20, h/2 - 15, color(255, 220, 180), color(255, 120, 120), true);
    
    // 小人伸出的手手臂與紅腫處
    let handMove = sin(animTimer * 2) * 3;
    stroke(255, 220, 180); strokeWeight(3);
    line(12, h/2 - 30, -5 + handMove, h/2 - 25); // 手臂
    noStroke();
    fill(255, 0, 0, 180 + sin(animTimer*5)*70); // 燙傷紅光閃爍
    ellipse(-5 + handMove, h/2 - 25, 8, 8);
    
  } else if (type === "sprain") {
    // 【扭傷情境】：操場跑道上，小人斜躺著揉腳、旁邊有閃爍驚嘆號
    // 繪製跑道線條
    stroke(230, 110, 80); strokeWeight(5); line(-w/2+10, h/2-15, w/2-10, h/2-15);
    stroke(255, 255, 255, 150); strokeWeight(2); line(-w/2+10, h/2-25, w/2-10, h/2-25);
    
    // 幾何小人斜坐在操場上 (旋轉角度)
    drawStickFigure(-15, h/2 - 15, color(255, 220, 180), color(100, 160, 255), true, QUARTER_PI);
    
    // 腫起來的腳踝與閃爍警示
    let isFlash = sin(animTimer * 3.5) > 0;
    fill(isFlash ? color(255, 50, 50) : color(240, 150, 150));
    ellipse(10, h/2 - 15, 12, 12);
    if(isFlash) {
      fill(255, 0, 0); textSize(12); text("⚡", 10, h/2 - 30);
    }
    
  } else if (type === "scratch") {
    // 【破皮情境】：小人跌倒趴在地板上，膝蓋破皮流血
    // 地板線
    stroke(180); strokeWeight(2); line(-w/2+15, h/2-15, w/2-15, h/2-15);
    
    // 幾何小人呈現往前跌倒、身體極度傾斜的姿態
    drawStickFigure(-10, h/2 - 15, color(255, 220, 180), color(255, 200, 50), true, HALF_PI);
    
    // 繪製摩擦出的紅腫傷口
    noStroke();
    fill(255, 50, 50, 200);
    ellipse(15, h/2 - 15, 14, 6);
    fill(200, 0, 0);
    ellipse(15, h/2 - 15, 6, 3);
    
  } else if (type === "cut") {
    // 【刀傷情境】：桌子上一把精細美工刀，幾何小人站在一旁手指滴血
    // 繪製桌子線
    stroke(160, 120, 90); strokeWeight(3); line(-w/2+10, h/2-15, w/2-10, h/2-15);
    
    // 繪製桌上的小尖刀/美工刀
    noStroke();
    fill(200); rect(-25, h/2 - 22, 18, 6); // 刀刃
    fill(230, 50, 50); rect(-37, h/2 - 22, 12, 8, 2); // 紅色刀柄
    
    // 幾何小人
    drawStickFigure(20, h/2 - 15, color(255, 220, 180), color(160, 120, 220), true);
    
    // 手指流血與落下的血滴滴答動畫
    stroke(255, 220, 180); strokeWeight(3); line(12, h/2 - 25, 2, h/2 - 25);
    noStroke();
    let dropY = (animTimer * 20) % 22;
    fill(255, 0, 0);
    ellipse(2, h/2 - 25 + dropY, 4, 6); // 掉落中的血
    ellipse(2, h/2 - 25, 6, 6); // 傷口點
    
  } else if (type === "tooth") {
    // 【牙齒斷情境】：小人撞到障礙物，白色的牙齒飛出來，右下角有一瓶精細冰牛奶
    // 繪製灰色的小台階障礙物
    fill(180); rect(-35, h/2 - 15, 25, 14, 2);
    
    // 幾何小人（往後傾倒、牙齒斷掉）
    drawStickFigure(-5, h/2 - 15, color(255, 220, 180), color(80, 200, 120), true, -0.3);
    
    // 飛出去的斷牙動畫 (拋物線與旋轉)
    let toothX = 5 + (animTimer * 12) % 30;
    let toothY = h/2 - 32 + pow((animTimer * 3) % 6 - 3, 2); // 拋物線跳動
    push();
    translate(toothX, toothY);
    rotate(animTimer * 2);
    fill(255); stroke(220); strokeWeight(1);
    rect(0, 0, 6, 7, 1);
    pop();
    
    // 右側準備一瓶小牛奶罐 (急救暗示)
    noStroke();
    fill(255); rect(45, h/2 - 18, 14, 22, 2); // 牛奶瓶身
    fill(100, 180, 255); rect(45, h/2 - 23, 14, 4); // 藍色包裝
    fill(255); textSize(9); text("MILK", 45, h/2 - 15);
    
  } else if (type === "muscle") {
    // 【肌肉拉傷情境】：幾何小人雙手舉著沉重的啞鈴，手臂肌肉處發出紅色緊繃脈衝波
    // 幾何小人本體
    drawStickFigure(0, h/2 - 15, color(255, 220, 180), color(240, 100, 180), true);
    
    // 繪製雙手舉高高拿著槓鈴
    stroke(50); strokeWeight(2);
    line(-25, h/2 - 42, 25, h/2 - 42); // 槓鈴桿
    fill(30); noStroke();
    ellipse(-25, h/2 - 42, 12, 12); ellipse(25, h/2 - 42, 12, 12); // 槓鈴片
    
    stroke(255, 220, 180); strokeWeight(3);
    line(-8, h/2 - 26, -18, h/2 - 42); // 左手手臂
    line(8, h/2 - 26, 18, h/2 - 42);  // 右手手臂
    
    // 肌肉緊繃拉傷的紅光閃爍特效
    noStroke();
    let pulse = 8 + sin(animTimer * 5) * 6;
    fill(255, 0, 0, 150);
    ellipse(-12, h/2 - 34, pulse, pulse);
    ellipse(12, h/2 - 34, pulse, pulse);
  }
}

// 繪製可拖曳選項的函式
function drawDraggableOptions() {
  let itemWidth = min(windowWidth / 3 - 45, 350);
  let itemHeight = 42;
  
  rectMode(CENTER);
  for (let i = 0; i < questions.length; i++) {
    stroke(70, 160, 90);
    strokeWeight(2);
    
    if (draggedOptionIndex === i) {
      fill(170, 245, 190); // 拖曳中
    } else {
      fill(225, 250, 230); // 平常狀態
    }
    
    // 如果已經交卷，依據該選項放置的位置是否正確，即時改變格子的外框顏色
    if (isSubmitted) {
      let isCorrect = checkSingleOptionCorrect(questions[i]);
    if (isCorrect) {
stroke(40, 160, 60);
strokeWeight(3);
fill(210, 245, 215);
} else {
stroke(220, 60, 60);
strokeWeight(3);
fill(255, 220, 220);
}
}
// 繪製可拖曳的選項方塊
rect(questions[i].currentX, questions[i].currentY, itemWidth, itemHeight, 10);
// 顯示急救處置的文字內容
noStroke();
fill(20);
textSize(12);
text(questions[i].correctText, questions[i].currentX, questions[i].currentY);
// 如果交卷了，在選項文字旁邊加上 ✅ 或 ❌
if (isSubmitted) {
textSize(16);
let isCorrect = checkSingleOptionCorrect(questions[i]);
if (isCorrect) {
text("✅", questions[i].currentX + itemWidth / 2 - 20, questions[i].currentY);
} else {
text("❌", questions[i].currentX + itemWidth / 2 - 20, questions[i].currentY);
}
}
}
}
// 檢查單一選項目前放置的位置是否正確
function checkSingleOptionCorrect(optionObj) {
for (let i = 0; i < questions.length; i++) {
let target = questions[i];
let dX = abs(optionObj.currentX - target.targetX);
let dY = abs(optionObj.currentY - target.targetY);
if (dX < 5 && dY < 5) {
let originalAnswer = getOriginalAnswerByType(target.type);
return optionObj.correctText === originalAnswer;
}
}
return false;
}
// 輔助核心：返回各傷口對應的唯一正確文本
function getOriginalAnswerByType(type) {
const originalAnswers = {
"燙傷": "沖、脫、泡、蓋、送",
"扭傷": "保護、休息、冰敷、壓迫、抬高",
"破皮": "生理食鹽水沖洗、塗藥膏、貼OK繃",
"刀傷": "直接壓迫止血、消毒、包紮",
"牙齒斷": "保存在冰牛奶或生理食鹽水中送醫",
"肌肉拉傷": "立即停止運動、冰敷並包紮壓迫"
};
return originalAnswers[type];
}
// 滑鼠按下事件
function mousePressed() {
if (isSubmitted) return;
let itemWidth = min(windowWidth / 3 - 45, 350);
let itemHeight = 42;
for (let i = questions.length - 1; i >= 0; i--) {
let dX = abs(mouseX - questions[i].currentX);
let dY = abs(mouseY - questions[i].currentY);
if (dX < itemWidth / 2 && dY < itemHeight / 2) {
draggedOptionIndex = i;
offsetX = mouseX - questions[i].currentX;
offsetY = mouseY - questions[i].currentY;
break;
}
}
}
// 滑鼠拖曳事件
function mouseDragged() {
if (draggedOptionIndex !== -1) {
questions[draggedOptionIndex].currentX = mouseX - offsetX;
questions[draggedOptionIndex].currentY = mouseY - offsetY;
}
}
// 滑鼠放開事件
function mouseReleased() {
if (draggedOptionIndex !== -1) {
let q = questions[draggedOptionIndex];
for (let i = 0; i < questions.length; i++) {
let target = questions[i];
let dX = abs(q.currentX - target.targetX);
let dY = abs(q.currentY - target.targetY);
if (dX < target.boxW / 2 && dY < target.boxH / 2) {
q.currentX = target.targetX;
q.currentY = target.targetY;
break;
}
}
draggedOptionIndex = -1;
}
}
// 點擊「交卷看成績」按鈕後觸發的計分邏輯
function checkAnswers() {
if (isSubmitted) return;
let correctCount = 0;
for (let i = 0; i < questions.length; i++) {
let target = questions[i];
let rightText = getOriginalAnswerByType(target.type);
for (let j = 0; j < questions.length; j++) {
let optionObj = questions[j];
let dX = abs(optionObj.currentX - target.targetX);
let dY = abs(optionObj.currentY - target.targetY);
if (dX < 5 && dY < 5) {
if (optionObj.correctText === rightText) {
correctCount++;
}
}
}
}
score = round((correctCount / questions.length) * 100);
isSubmitted = true;
submitButton.attribute('disabled', '');
if (score >= 60) {
createConfetti();
}
}
// 產生繽紛彩帶粒子的初始化函式
function createConfetti() {
for (let i = 0; i < 180; i++) {
particles.push({
x: random(windowWidth),
y: random(-200, -20),
size: random(7, 13),
color: color(random(255), random(255), random(255)),
speedY: random(2.5, 6.5),
speedX: random(-2, 2),
rotation: random(0, TWO_PI),
rotSpeed: random(-0.08, 0.08)
});
}
}
// 動態更新並繪製彩帶的函式
function updateAndDrawParticles() {
rectMode(CENTER);
for (let p of particles) {
p.y += p.speedY;
p.x += p.speedX;
p.rotation += p.rotSpeed;
push();
translate(p.x, p.y);
rotate(p.rotation);
fill(p.color);
noStroke();
rect(0, 0, p.size, p.size * 1.6);
pop();
if (p.y > windowHeight) {
p.y = random(-60, -10);
p.x = random(windowWidth);
}
}
}
// 繪製結算成績面板的函式
function drawScoreBoard() {
fill(0, 0, 0, 160);
rectMode(CORNER);
rect(0, 0, windowWidth, windowHeight);
rectMode(CENTER);
fill(255);
stroke(255, 215, 0);
strokeWeight(5);
rect(windowWidth / 2, windowHeight / 2, 420, 260, 15);
noStroke();
fill(0);
textSize(28);
text("🎉 測試結束 🎉", windowWidth / 2, windowHeight / 2 - 70);
textSize(24);
text("您的總成績為：" + score + " 分", windowWidth / 2, windowHeight / 2 - 10);
textSize(18);
if (score >= 60) {
fill(40, 160, 60);
text("太棒了！你通過了急救小達人測試！👏", windowWidth / 2, windowHeight / 2 + 45);
} else {
fill(220, 50, 50);
text("再接再厲！重新整理網頁可以再試一次喔！💪", windowWidth / 2, windowHeight / 2 + 45);
}
}