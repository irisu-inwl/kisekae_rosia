window.addEventListener('load', init);
function init() {
    // Stageオブジェクトを作成。表示リストのルートになります。
    var stage = new createjs.Stage('rosia_kisekae');

    //----------------------------------------
    // 土台を作成
    //----------------------------------------
    var background = new createjs.Shape();
    var costume_background = new createjs.Shape();
    background.graphics.setStrokeStyle(2).beginStroke('red').beginFill('Bisque').drawRect(600, 20, 550, 800);
    costume_background.graphics.setStrokeStyle(2).beginStroke('red').beginFill('Bisque').drawRect(50, 20, 500, 800);
    stage.addChild(background);
    stage.addChild(costume_background);
    // ロージアちゃんの素体
    var rosia_chan = new createjs.Bitmap('img/rosi_neutral.png');
    rosia_chan.x = 650;
    rosia_chan.y = 50;
    stage.addChild(rosia_chan);

    // ロージアちゃんの衣装
    var rosia_costume = new createjs.Bitmap('img/rosia_costume.png');
    rosia_costume.x = -50;
    rosia_costume.y = -100;
    stage.addChild(rosia_costume);
    
    

    // 円のピース
    //stage.addChild(pieceCircle);
    rosia_costume.addEventListener('mousedown', handleMouseDown);
    //----------------------------------------
    // マウスイベントを登録
    //----------------------------------------
    
    function handleMouseDown(event) {
        // currentTargetで、どれがマウスダウンされたか判別
        var piece = event.currentTarget;
        // 目標の対象を判定する
        var targetBase;
        // 目標のオブジェクトはロージアちゃん固定
        targetBase = rosia_chan;
        
        // マウスが押された場所を保存
        var mouseDownX = stage.mouseX - piece.x;
        var mouseDownY = stage.mouseY - piece.y;
        // ドラッグ関連イベントを登録
        piece.addEventListener('pressmove', handlePressMove);
        piece.addEventListener('pressup', handlePressUp);
        function handlePressMove(event) {
            updateMousePosition(); // マウスの座標に追随
        }
        function handlePressUp(event) {
            updateMousePosition(); // マウスの座標に追随
            // mergeObject()
            // ドラッグ関連イベントを解除
            piece.removeEventListener('pressmove', handlePressMove);
            piece.removeEventListener('pressup', handlePressUp);
        }
        // マウスのドラッグ処理
        function updateMousePosition() {
            // オブジェクトの座標はマウスの座標に追随
            // ただしマウスダウンした場所のズレを補正
            piece.x = stage.mouseX - mouseDownX;
            piece.y = stage.mouseY - mouseDownY;
        }
        // TODO:物体と物体の当たり判定を行い、吸着させる処理
        function mergeObject(){
            // マウスアップされたときに、目標のシェイプとの当たり判定をとる
            var pt = targetBase.localToLocal(0, 0, piece);
            var isHit = piece.hitTest(pt.x, pt.y);
            if (isHit == true) {
                // 吸着させる
                piece.x = targetBase.x;
                piece.y = targetBase.y;
            }
        }
    }
    
    //----------------------------------------
    // 時間経過
    //----------------------------------------
    createjs.Ticker.addEventListener('tick', handleTick);
    function handleTick(event) {
    // Stageの描画を更新
    stage.update();
    }
}