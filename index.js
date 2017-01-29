load_config = {};
function getJSON(){
    var req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
    req.open('get', 'costume_config.json', true); // アクセスするファイルを指定
    req.overrideMimeType("text/plain; charset=UTF-8");
    req.send(null); // HTTPリクエストの発行
	
    // レスポンスが返ってきたらconvertCSVtoArray()を呼ぶ	
    req.onload = function(){
	    load_config = JSON.parse(req.responseText);
    }
}

window.addEventListener('load', init);
getJSON();

function create_costume_list(){
    // jsonから衣装オブジェクトのリストを読み込む
    /* "typeの名前":{
        'name':
        'path'
        'type'
        'object':オブジェクトの実態
        'save_enable': 画面に保存するか否か
        }
    *
    */
    costume_list = {};
    for(costume_type of load_config['costume_type_list']){
        costume_list[costume_type['type_name']] = [];
    }
    for(costume of load_config['costume_info']){
        // ついでにこの中にObjectを入れちゃう。
        costume['object'] = new createjs.Bitmap(costume['path']);
        // 画面に表示を残すかのboolean
        costume['save_enable'] = false;

        costume_list[costume['type']].push(costume);
    }
    return costume_list;
}
function get_costume_type_list(){
    costume_type_list = [];
    for(costume_type of load_config['costume_type_list']){
        costume_type_list.push(costume_type);
    }
    return costume_type_list;
}


function init() {
    // Stageオブジェクトを作成。表示リストのルートになります。
    var stage = new createjs.Stage('rosia_kisekae');
    // 現在表示する衣装
    var selected_type = 'tops';
    // 衣装情報リスト
    var costume_objects = create_costume_list();

    //----------------------------------------
    // 土台を作成
    //----------------------------------------
    var background = new createjs.Shape();
    var costume_background = new createjs.Shape();
    // ロージアちゃんが座る土台だょ
    background.x = 600;
    background.y = 50;
    background.graphics.setStrokeStyle(2).beginStroke('red').beginFill('Bisque').drawRect(0, 0, 550, 800);
    // 衣装置く度台
    costume_background.x = 50;
    costume_background.y = 50;
    costume_background.graphics.setStrokeStyle(2).beginStroke('red').beginFill('Bisque').drawRect(0, 0, 525, 800);
    stage.addChild(background);
    stage.addChild(costume_background);
    console.log('70:costume_background.y:'+costume_background.graphics.y)
    // ロージアちゃんの素体
    /**/
    var rosia_chan = new createjs.Bitmap('img/rosi_neutral.png');
    rosia_chan.x = 650;
    rosia_chan.y = 50;

    stage.addChild(rosia_chan);
    
    // 可視化オブジェクトはsetに格納する。
    visible_costumes = new Set();
    // 衣装オブジェクトの初期座標設定
    setting_object_coordinate(costume_objects[selected_type]);
    // 可視化オブジェクトとして衣装を追加
    visible_set_add(costume_objects[selected_type]);
    // 可視化オブジェクトを表示
    description_objects();

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
    // オブジェクト座標を設定
    function setting_object_coordinate(costume_list){
        console.log('costume_background.y:'+costume_background.y)
        let max_y = 0;
        let description_x = costume_background.x;
        let description_y = costume_background.y;
        for(costume_info of costume_list){
            if(!costume_background.hitTest(description_x, description_y )){
                // 配置する衣装が外れたらダメ
                description_x = costume_background.x;
                description_y += max_y;
                max_y = 0;
            }
            costume_info['object'].x = description_x;
            costume_info['object'].y = description_y;
            description_x += costume_info['object'].image.width;
            if(costume_info['object'].image.height > max_y){ max_y = costume_info['object'].image.height; }
            costume_info['object'].addEventListener('mousedown', handleMouseDown);
            // description_y += 
        }
    }

    // オブジェクトの描写
    // TODO: 上に着る服は上に着させるようにしよう
    function description_objects(){
        // visible_costumes_list = Array.from(visible_costumes.values());
        for(costume_info of visible_costumes){
            stage.addChild(costume_info['object']);
        }
    }

    // 選択した衣装タイプの衣装を可視化オブジェクトとして代入
    function visible_set_add(costume_list){
        for(costume_info of costume_list){
            visible_costumes.add(costume_info);
        }
    }

    // 非保存衣装を可視化オブジェクトから削除
    function visible_set_unsave_object_delete(){
        for(costume_info of visible_costumes){
            if(costume_info[save_enable] == false){
                visible_costumes.delete(costume_object);
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