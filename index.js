let load_config = {};

$.ajax({type : 'GET',
        url : 'costume_config.json',
        async : false,
        dataType : 'json',
        success : function(data){
            console.log(data);
            load_config = data;
            window.addEventListener('load', init); 
        }
});

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
    let costume_list = {};
    for(let costume_type of load_config['costume_type_list']){
        costume_list[costume_type['type_name']] = [];
    }
    for(let costume of load_config['costume_info']){
        // ついでにこの中にObjectを入れちゃう。
        costume['object'] = new createjs.Bitmap(costume['path']);
        // 画面に表示を残すかのboolean
        costume['save_enable'] = false;

        costume_list[costume['type']].push(costume);
    }
    return costume_list;
}
function get_costume_type_list(){
    let costume_type_list = [];
    for(let costume_type of load_config['costume_type_list']){
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
    // 衣装設定変更ボタンを配置させる。
    let costume_type_list = get_costume_type_list();
    let costume_type_buttons = [];
    const btn_w = 120; const btn_h = 40;
    let btn_x = 50; const btn_y = 0;
    for(let costume_type_obj of costume_type_list){
        let costume_type_button = new createjs.Container(); // コンテナとしてボタンを表現
        costume_type_button.type_name = costume_type_obj['type_name'];
        costume_type_button.x = btn_x; costume_type_button.y = btn_y;
        let button_shape = new createjs.Shape();
        const button_color = (selected_type == costume_type_obj['type_name']) ? 'CornflowerBlue' : 'Lavender';
        button_shape.graphics.beginFill(button_color);
        button_shape.graphics.drawRoundRect(0, 0, btn_w, btn_h, 10, 10); //100px*40pxの方形を描画。10pxの角丸を設定。
        costume_type_button.shape = button_shape;
        costume_type_button.addChild(button_shape)
        let label = new createjs.Text(costume_type_obj['description'], "24px sans-serif", 'white');
        label.x = btn_w / 2;
        label.y = btn_h / 2;
        label.textAlign = "center";
        label.textBaseline = "middle";
        costume_type_button.addChild(label);
        stage.addChild(costume_type_button); // 表示リストに追加
        costume_type_buttons.push(costume_type_button);
        costume_type_button.addEventListener('mousedown', handle_button_mousedown);
        btn_x += btn_w + 5;
    }

    // ロージアちゃんの素体
    /**/
    var rosia_chan = new createjs.Bitmap('img/rosi_neutral.png');
    rosia_chan.x = 650;
    rosia_chan.y = 50;

    stage.addChild(rosia_chan);
    // 可視化オブジェクトはsetに格納する。
    let visible_costumes = new Set();
    // 衣装の表示処理
    description_costume();
    // 衣装をクリックしたときの処理
    function handleMouseDown(event) {
        // currentTargetで、どれがマウスダウンされたか判別
        var piece = event.currentTarget;
        // 目標の対象を判定する
        // 吸着処理用の処理
        // let targetBase;
        // 目標のオブジェクトはロージアちゃん固定
        // targetBase = rosia_chan;
        
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
            // 衣装がロージアちゃんの土台に入ったら保存対象とする。
            var pt = piece.localToLocal(0, 0, background);
            var isHit = background.hitTest(pt.x, pt.y);
            let selected_object = (Array.from(visible_costumes.values())).find(function(elem){if(piece == elem['object']){return elem;}});
            console.log(selected_object['name']);
            if(isHit){
                console.log('衣装当たり判定');
                selected_object['save_enable'] = true;
            }else{
                console.log('衣装当たってない判定')
                selected_object['save_enable'] = false;
            }

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
        /*
        function mergeObject(){
            // マウスアップされたときに、目標のシェイプとの当たり判定をとる
            var pt = targetBase.localToLocal(0, 0, piece);
            var isHit = piece.hitTest(pt.x, pt.y);
            if (isHit == true) {
                // 吸着させる
                piece.x = targetBase.x;
                piece.y = targetBase.y;
            }
        }*/
    }
    /*-----------------------------
    * ボタン押したときの処理
    ------------------------------*/
    function handle_button_mousedown(event){
        let piece = event.currentTarget;
        let selected_button = costume_type_buttons.find(function(elem){if(elem.type_name == selected_type)return elem;});
        console.log('163'+selected_button.type_name);
        //const button_color = (selected_type == costume_type_obj['type_name']) ? 'CornflowerBlue' : 'Lavender';
        selected_button.shape.graphics.beginFill('Lavender');
        selected_button.shape.graphics.drawRoundRect(0, 0, btn_w, btn_h, 10, 10); //100px*40pxの方形を描画。10pxの角丸を設定。
        selected_type = piece.type_name;
        piece.shape.graphics.beginFill('CornflowerBlue');
        piece.shape.graphics.drawRoundRect(0, 0, btn_w, btn_h, 10, 10); //100px*40pxの方形を描画。10pxの角丸を設定。
        // 可視化オブジェクトから削除
        visible_set_unsave_object_delete();
        description_costume();
    }
    // 衣装を表示させる処理
    function description_costume(){
        // 衣装オブジェクトの初期座標設定
        setting_object_coordinate(costume_objects[selected_type]);
        // 可視化オブジェクトとして衣装を追加
        visible_set_add(costume_objects[selected_type]);
        // 可視化オブジェクトを表示
        description_objects();
    }
    // オブジェクト座標を設定
    function setting_object_coordinate(costume_list){
        let max_y = 0;
        let description_x = costume_background.x;
        let description_y = costume_background.y;
        for(let costume_info of costume_list){
            if(!costume_info['save_enable']){
                if(!costume_background.hitTest(description_x + costume_info['object'].image.width/2, description_y)){
                    // 配置する衣装が外れたらダメ
                    description_x = costume_background.x;
                    description_y += max_y;
                    max_y = 0;
                }
                costume_info['object'].x = description_x;
                costume_info['object'].y = description_y;
                description_x += costume_info['object'].image.width;
                if(costume_info['object'].image.height > max_y){ max_y = costume_info['object'].image.height; }
                //衣装のイベントリスナーを設定。
                costume_info['object'].addEventListener('mousedown', handleMouseDown);
            }
        }
    }

    // オブジェクトの描写
    function description_objects(){
        // 可視化オブジェクトの順序をトップスならばスカートの上、トップスのインナーは上着の下といったソートを行う。
        // ソートは辞書式順序で行う。
        visible_costumes = new Set((Array.from(visible_costumes.values())).sort(function(a,b){
                // まずは衣装情報オブジェクトのlayer情報から順序を判断 5が下のレイヤーで1が高いレイヤー
                if( a['layer'] > b['layer'] ) return -1;
                if( a['layer'] < b['layer'] ) return 1;
                // 衣装情報のレイヤーが等しい場合はタイプ別のレイヤーで判断する。
                const a_type_obj = costume_type_list.find(function(elem){if(elem.type_name == a['type']){return elem;}});
                const b_type_obj = costume_type_list.find(function(elem){if(elem.type_name == b['type']){return elem;}});
                if( a_type_obj['layer'] > b_type_obj['layer'] ) return -1;
                if( a_type_obj['layer'] < b_type_obj['layer'] ) return 1;
                return 0;
        }));
        (Array.from(visible_costumes.values())).forEach(function(elem){console.log(elem['name'])});
        for(let costume_info of visible_costumes){
            stage.addChild(costume_info['object']);
        }
    }

    // 選択した衣装タイプの衣装を可視化オブジェクトとして代入
    function visible_set_add(costume_list){
        for(let costume_info of costume_list){
            visible_costumes.add(costume_info);
        }
    }

    // 非保存衣装を可視化オブジェクトから削除
    function visible_set_unsave_object_delete(){
        for(let costume_info of visible_costumes){
            if(costume_info['save_enable'] == false){
                visible_costumes.delete(costume_info);
                stage.removeChild(costume_info['object']);
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