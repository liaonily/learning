function drawMapUnit(x, y, state, c) {//画单元格
  if(state === 0){
    c.fillStyle = "#cccccc";
  } else{
    c.fillStyle = "#000000";
  }
  c.fillRect(x + 3 + padding, y + 3 + padding, 34, 3);
  c.fillRect(x + 3 + padding, y + 34 + padding, 34, 3);
  c.fillRect(x + 3 + padding, y + 6 + padding, 3, 28);
  c.fillRect(x + 34 + padding, y + 6 + padding, 3, 28);
  c.fillRect(x + 9 + padding, y + 9 + padding, 22, 22);
}

function drawMap() {//画游戏运行地图
  for(var i = 0; i < map.length; i++) {
    for (var j = 0; j < map[i].length; j++){
      drawMapUnit(i * 40, j * 40, map[i][j], ctx);
    }
  }
  blocks[0].shape.forEach(function (col, x) {//画当前block
    col.forEach(function (item, y) {
      if(item){//block的具有图形的格子才画
        drawMapUnit((blocks[0].x + x) * 40, (blocks[0].y + y) * 40, item, ctx);
      }
    });
  });
}

function drawSubMap() {//画小地图
  for(var i = 0; i < subMap.length; i++) {
    for (var j = 0; j < subMap[i].length; j++){
      drawMapUnit(i * 40, j * 40, subMap[i][j], ctx2);
    }
  }
  blocks[1].shape.forEach(function (col, x) {//画下一个block
    col.forEach(function (item, y) {
      if(item){//block的具有图形的格子才画
        drawMapUnit(x * 40,  y * 40, item, ctx2);
      }
    });
  });
}

var player = {//玩家信息
  score: 0,
  isGameOver: false,
  scoreElem: document.getElementById("score")
};

player.scoreElem.innerText = player.score;

function Block(x, y) {
  this.x = 4;
  this.y = -3;
  this.shape = [];
  this.type = null;
  this.isDie = false;
  this.len = 2;//shape的最长边，基于该数据确定旋转方块的边长
  this.draw = function() {
    switch (this.type) {
      case 0:
        this.len = 2; // 不可旋转
        this.shape = [[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
        break;
      case 1:
        this.len = 3;
        this.shape = [[0, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]];
        break;
      case 2:
        this.len = 3;
        this.shape = [[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]];
        break;
      case 3:
        this.len = 3;
        this.shape = [[0, 1, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]];
        break;
      case 4:
        this.len = 3;
        this.shape = [[0, 1, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0]];
        break;
      case 5:
        this.len = 3;
        this.shape = [[1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]];
        break;
      case 6:
        this.len = 4;
        this.shape = [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];
        break;
      default:
    }
  };
  this.getTopRow = function() {//获取最上行
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if(this.shape[j][i]){
          return i;
        }
      }
    }
  };
  this.rotate = function() {//旋转方法，用temp保存旋转后的block，与map的点以及边界比对，与map重合或超过边界的不能旋转
    switch (this.len) {
      case 3:
      case 4:
        var i, j, temp = [[], [], [], []];
        for (i = 0; i < this.len; i++) {
          for (j = 0; j < this.len; j++) {
            temp[j][this.len - 1 - i] = this.shape[i][j];
          }
        }
        if(this.y >= 0) {
          for(i = 0; i < 4; i++) {
            for(j = 0; j < 4; j++) {
              if((map[this.x + i] ===  undefined ||
                map[this.x + i][this.y + j] === undefined ||
                map[this.x + i][this.y + j] === 1) && temp[i][j] ) {
                return false;
              }
            }
          }
        }
        this.shape = temp;
        break;
      default:
        return false;
    }
  };
  this.moveLeft = function() {
    if(this.y >= 0) {
      for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
          if ((map[this.x + i - 1] === undefined ||
            map[this.x + i - 1][this.y + j] === undefined ||
            map[this.x + i - 1][this.y + j] === 1) && this.shape[i][j]){
            return false;
          }
        }
      }
      this.x--;
    }
  };
  this.moveRight = function() {
    if(this.y >= 0) {
      for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
          if ((map[this.x + i + 1] === undefined ||
            map[this.x + i + 1][this.y + j] === undefined ||
            map[this.x + i + 1][this.y + j] === 1) && this.shape[i][j]){
            return false;
          }
        }
      }
      this.x++;
    }
  };
  this.moveDown = function() {
    for (i = 0; i < 4; i++) {
      for (j = 0; j < 4; j++) {//当运行到底部或碰到障碍，block不能向下，设置其死亡
        if (this.y + j >= -1 &&
          (map[this.x + i] === undefined ||
          map[this.x + i][this.y + j + 1] === undefined ||
          map[this.x + i][this.y + j + 1] === 1) && this.shape[i][j]){
          this.die();
          return false;
        }
      }
    }
    this.y++;
  };
  this.accelerate = function() {//加速掉下
    this.moveDown();
  };
  this.die = function() {
    //死亡
    this.isDie = true;
    window.clearInterval(this.downTimer);
    this.downTimer = null;
    //将block赋值到map，判断是否可得分，判断游戏是否结束
    var i,j;
    for (i = 0; i < 4; i++){
      for (j = 0; j < 4; j++) {
        if( this.y + this.getTopRow() < 0 ) {//游戏结束
          player.isGameOver = true;
          return;
        } else {//赋值
          if (this.shape[i][j]) {
            map[this.x + i][this.y + j] = this.shape[i][j];
          }
        }
      }
    }
    //判断是否可得分
    var lines = [];
    for(j = 0 ; j < 20; j++) { //行数
      var count = 0;
      for(i = 0; i < 10; i++ ){ //列数
        if(map[i][j]){
          count++;
        }
        if(count === 10) {//记录可消除的行数
          lines.push(j);
        }
      }
    }
    if(lines.length > 0){//有可消除的行，计分
      var score = 0;
      switch (lines.length) {
        case 1:
          score = 100;
          break;
        case 2:
          score = 300;
          break;
        case 3:
          score = 700;
          break;
        case 4:
          score = 1500;
          break;
        default:
      }
      player.score += score;
      player.scoreElem.innerText = player.score;
    }
    lines.forEach(function(y) {//有消除行时消除，达到下落的效果
      for(var i = 0; i < 10; i++){//消除满了的行
        map[i][y] = 0;
      }
      for(var j = y - 1; j >= 0; j--) {//将上一行赋给下一行
        for(var k = 0; k < 10; k++){
          map[k][j + 1] = map[k][j];
        }
      }
      for(var m = 0; m < 10; m++){//最顶行没有更上面的行给它赋值，将最顶行设为0
        map[m][0] = 0;
      }
    });
  };
  this.downTimer = null;
  this.downAuto = function() {//自动掉落
    var that = this;
    that.downTimer = window.setInterval(function(){
      if(!that.isDie){
        that.moveDown();
      }
    }, 400);
  };
  this.init = function() {//初始化
    this.type = Math.floor(Math.random() * 7 + 0);
    this.draw();
  };
}
var blocks = [];
var block1 = new Block();
var block2 = new Block();
blocks.push(block1);
blocks.push(block2);
blocks[0].init();
blocks[1].init();
blocks[0].downAuto();

function createNewBlock() {
  if(blocks[0].isDie && !player.isGameOver){
    blocks.shift();
    var block = new Block();
    blocks.push(block);
    block.init();
    blocks[0].downAuto();
  }
}

document.body.addEventListener("keydown",function(e){//监听玩家操作
  if (!blocks[0].isDie){
    switch (e.keyCode) {//向上及w键，旋转；向下及s键，加速下落；向左及a键，向左移动；向右及d键，向右移动
      case 38:
      case 87:
        blocks[0].rotate();
        break;
      case 37:
      case 65:
        blocks[0].moveLeft();
        break;
      case 39:
      case 68:
        blocks[0].moveRight();
        break;
      case 40:
      case 83:
        blocks[0].accelerate();
        break;
      default:
    }
  }
});

var timer = window.setInterval(function () {
  ctx.clearRect(0, 0, 410, 810);
  createNewBlock();
  drawMap();
  drawSubMap();
  if(player.isGameOver){
    clearInterval(timer);
    ctx.fillStyle = "#222222";
    ctx.fillRect(110, 250, 200, 200);
    ctx.font = "30px calibri";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("GAME OVER", 140, 320);
    ctx.font = "15px calibri";
    ctx.fillText("F5 to restart", 180, 370);
    return false;
  }
}, 100);
