const DataManager = require('DataManager');
cc.Class({
    extends: cc.Component,

    properties: {
        infoPanel: cc.Node,
        buttonPanel: cc.Node,
        tip: cc.Node,

        yellowKeyLabel:cc.Label,
        blueKeyLabel:cc.Label,
        redKeyLabel: cc.Label,

        floorLabel: cc.Label,

        HPLabel: cc.Label,
        ATKLabel: cc.Label,
        DEFLabel: cc.Label,
        coinLabel: cc.Label,

        isPanelActive: false,
        isLoadData:false,
        upFloor: true,

        HP: {
            default: 1000,
            serializable: false,
        },
        ATK: {
            default: 10,
            serializable: false,
        },
        DEF: {
            default: 10,
            serializable: false,
        },
        coin: {
            default: 0,
            serializable: false,
        },

        yellowKey: {
            default: 0,
            serializable: false,
        },
        blueKey: {
            default: 0,
            serializable: false,
        },
        redKey: {
            default: 0,
            serializable: false,
        },

        floorLayerName: {
            default: 'floor',
        },
        barrierLayerName: {
            default: 'barrier',
        },
        doorLayerName: {
            default: 'door',
        },
        propLayerName: {
            default: 'prop',
        },
        monsterLayerName: {
            default: 'monster',
        },
        objectGroupName: {
            default: 'players',
        },
        startObjectName: {
            default: 'SpawnPoint'
        },
        successObjectName: {
            default: 'SuccessPoint'
        },
        playerSpriteFrames: {
            default: [],
            type: cc.SpriteFrame,
        },
    },

    onLoad: function () {
        this.tmxAssets = [];
        this.initData();

        this.begainShowTip = false;
        this.increase = false;
        this.decrease = false;
        this.time = 0;

        this.talkPanel = this.node.getChildByName('talkPanel');
        this.fightPanel = this.node.getChildByName('fightPanel');
        this.getFightPanel();

        DataManager.loadMonsterData((monsters) => {
            DataManager.loadPropData((props) => {
                this.monsters = monsters;
                this.props = props;
            });
        });

        this.floor = 1;
        this.createTiledMap();
        this.loadTiledMap(this.floor);

        this.initPanel();
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
    },

    initData: function () {
        this.barrierInfo = [];
        this.doorInfo = [];
        this.propInfo = [];
        this.monsterInfo = [];
        for (let i = 0; i < 60;i++){
            this.barrierInfo[i] = [];
            this.doorInfo[i] = [];
            this.propInfo[i] = [];
            this.monsterInfo[i] = [];
        };
        
    },

    getFightPanel: function () {
        this.fightPanel = this.node.getChildByName('fightPanel');
        this.myIcon = this.fightPanel.getChildByName('mySprite').getComponent(cc.Sprite);
        this.enemyIcon = this.fightPanel.getChildByName('enemySprite').getComponent(cc.Sprite);
        this.myHPData = this.fightPanel.getChildByName('myHPData').getComponent(cc.Label);
        this.enemyHPData = this.fightPanel.getChildByName('enemyHPData').getComponent(cc.Label);
        this.myATKData = this.fightPanel.getChildByName('myATKData').getComponent(cc.Label);
        this.enemyATKData = this.fightPanel.getChildByName('enemyATKData').getComponent(cc.Label);
        this.myDEFData = this.fightPanel.getChildByName('myDEFData').getComponent(cc.Label);
        this.enemyDEFData = this.fightPanel.getChildByName('enemyDEFData').getComponent(cc.Label);
    },

    initPanel: function () {
        let scale = (cc.visibleRect.height - 426) / 2 / 104;

        let x = - cc.visibleRect.width / 2;
        let y = cc.visibleRect.height / 2;
        this.infoPanel.scale = scale;
        this.infoPanel.setPosition(x, y);
        this.buttonPanel.scale = scale;

        this.HPLabel.string = this.HP;
        this.ATKLabel.string = this.ATK;
        this.DEFLabel.string = this.DEF;
        this.coinLabel.string = this.coin;

    },

    loadTiledMap: function (index) {
        if (this.tmxAssets[index - 1]) {
            cc.log(this.tmxAssets[index - 1]);
            this.floor = index;
            this.tiledMap.tmxAsset = this.tmxAssets[index - 1];
            this.initTiledMap();
            cc.log('have tmxAsset');
            cc.log(index);
        } else {
            DataManager.loadTmxAsset(index, (tmxAsset) => {
                this.tmxAssets[index - 1] = tmxAsset;
                this.tiledMap.tmxAsset = tmxAsset;
                this.floor = index;

                this.initTiledMap();
                cc.log(index);

            });
            
        };
    },

    createTiledMap: function () {
        this.tiledMapNode = new cc.Node();
        this.node.addChild(this.tiledMapNode);
        this.tiledMap = this.tiledMapNode.addComponent('cc.TiledMap');

        this.tiledMapNode.setLocalZOrder(-1);
        this.tiledMapNode.setAnchorPoint(0, 0);

        this.player = new cc.Node();
        this.tiledMapNode.addChild(this.player);
        this.player.setLocalZOrder(10);
        let sprite = this.player.addComponent(cc.Sprite);
        sprite.spriteFrame = this.playerSpriteFrames[1];
    },

    initTiledMap: function () {
        let mapSize = this.tiledMapNode.getContentSize();
        this.tiledMapNode.setPosition(-mapSize.width / 2, -mapSize.height / 2);

        this.floorLayer = this.tiledMap.getLayer(this.floorLayerName);
        this.barrierLayer = this.tiledMap.getLayer(this.barrierLayerName);
        this.doorLayer = this.tiledMap.getLayer(this.doorLayerName);
        this.propLayer = this.tiledMap.getLayer(this.propLayerName);
        this.monsterLayer = this.tiledMap.getLayer(this.monsterLayerName);
        for (let i = 0; i < this.barrierInfo[this.floor - 1].length; i++) {
            this.barrierLayer.removeTileAt(this.barrierInfo[this.floor - 1][i]);
        };
        for (let i = 0; i < this.doorInfo[this.floor - 1].length; i++) {
            this.doorLayer.removeTileAt(this.doorInfo[this.floor - 1][i]);
        };
        for (let i = 0; i < this.propInfo[this.floor - 1].length; i++) {
            this.propLayer.removeTileAt(this.propInfo[this.floor - 1][i]);
        };
        for (let i = 0; i < this.monsterInfo[this.floor - 1].length; i++) {
            this.monsterLayer.removeTileAt(this.monsterInfo[this.floor - 1][i]);
        };

        let objectGroup = this.tiledMap.getObjectGroup(this.objectGroupName);
        let startObj = objectGroup.getObject(this.startObjectName);
        let endObj = objectGroup.getObject(this.successObjectName);
        if (!startObj || !endObj) return;

        let startPos = cc.p(startObj.sgNode.x, startObj.sgNode.y);
        let endPos = cc.p(endObj.sgNode.x, endObj.sgNode.y);

        this.startTile = this.getTilePos(startPos);
        this.endTile = this.getTilePos(endPos);

        if (this.isLoadData) {
            this.isLoadData = false;
        } else if (this.upFloor) {
            this.curTile = this.startTile;
        } else{
            this.curTile = this.endTile;
        };
        this.updatePlayerPos(this.curTile);
    },

    updatePlayerPos: function () {
        let posInPixel = this.floorLayer.getPositionAt(this.curTile);
        posInPixel = cc.p(posInPixel.x + 16, posInPixel.y + 16);
        this.player.setPosition(posInPixel);
    },

    getTilePos: function (posInPixel) {
        
        let mapSize = this.tiledMapNode.getContentSize();
        let tileSize = this.tiledMap.getTileSize();
        let x = Math.floor(posInPixel.x / tileSize.width);
        let y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);

        return cc.p(x, y);
    },

    removeTile: function (layer, newTile) {
        if (!layer || !newTile) return;

        if (layer == this.barrierLayer){
            this.barrierInfo[this.floor - 1].push(newTile);
        } else if (layer == this.doorLayer){
            this.doorInfo[this.floor - 1].push(newTile);

        } else if (layer == this.propLayer){
            this.propInfo[this.floor - 1].push(newTile);

        } else if (layer == this.monsterLayer) {
            this.monsterInfo[this.floor - 1].push(newTile);

        };

        layer.removeTileAt(newTile);
    },

    updateInfo: function () {
        this.yellowKeyLabel.string = this.yellowKey;
        this.blueKeyLabel.string = this.blueKey;
        this.redKeyLabel.string = this.redKey;
        this.HPLabel.string = this.HP;
        this.ATKLabel.string = this.ATK;
        this.DEFLabel.string = this.DEF;
        this.coinLabel.string = this.coin;
    },

    tryMoveToNewTile: function (newTile) {
        let mapTileSize = this.tiledMap.getMapSize();
        if (newTile.x < 0 || newTile.x >= mapTileSize.width || newTile.y < 0 || newTile.y >= mapTileSize.height) return;


        let barrierGID = this.barrierLayer.getTileGIDAt(newTile);
        if (barrierGID) {
            let barrierProperties = this.tiledMap.getPropertiesForGID(barrierGID);
            if (!barrierProperties) {
                cc.log('is wall!');
                return false;
            };
            if (barrierProperties.type == 'UpStair') {
                cc.log('upstair');
                this.upFloor = true;
                let nextFloor = this.floor + 1;
                this.loadTiledMap(nextFloor);
                this.floorLabel.string = '第' + nextFloor + '层';

            } else if (barrierProperties.type == 'DownStair') {
                cc.log('downstair');
                this.upFloor = false;
                let nextFloor = this.floor - 1;
                this.loadTiledMap(nextFloor);
                this.floorLabel.string = '第' + nextFloor + '层';

            };
            return;
        };

        let doorGID = this.doorLayer.getTileGIDAt(newTile);
        if (doorGID) {
            let doorProperties = this.tiledMap.getPropertiesForGID(doorGID);
            if (!doorProperties) {
                this.removeTile(this.doorLayer,newTile);
            } else if (doorProperties.type == 'yellow_door') {
                if (this.yellowKey > 0) {
                    cc.log('yellow_key - 1');
                    this.yellowKey--;
                    this.removeTile(this.doorLayer, newTile);
                } else {
                    cc.log('have no yellow_key');
                    let tipString = '没有黄钥匙';
                    this.showTip(cc.Color.RED, tipString);
                    return;
                };
            } else if (doorProperties.type == 'blue_door') {
                if (this.blueKey > 0) {
                    cc.log('blue_key - 1');
                    this.blueKey--;
                this.removeTile(this.doorLayer,newTile);
                } else {
                    cc.log('have no blue_key');
                    let tipString = '没有蓝钥匙';
                    this.showTip(cc.Color.RED, tipString);
                    return;
                };
            } else if (doorProperties.type == 'red_door') {
                if (this.redKey > 0) {
                    cc.log('red_key - 1');
                    this.redKey--;
                this.removeTile(this.doorLayer,newTile);
                } else {
                    cc.log('have no red_key');
                    let tipString = '没有红钥匙';
                    this.showTip(cc.Color.RED, tipString);
                    return;
                };
            } else if (doorProperties.type == 'guard_door') {
                cc.log('red_key + 1');
                this.removeTile(this.doorLayer,newTile);
            };
            this.updateInfo();
            return;
        };

        let propGID = this.propLayer.getTileGIDAt(newTile);
        if (propGID) {
            let propProperties = this.tiledMap.getPropertiesForGID(propGID);
            


            if (!propProperties) {
                this.removeTile(this.propLayer, newTile);
            } else {
                for (let i = 0; i < this.props.length; i++) {
                    if (propProperties.type == this.props[i].name) {
                        if (this.props[i].HP){
                            this.HP += parseInt(this.props[i].HP);
                        } else if (this.props[i].key) {
                            let tipString;
                            switch (this.props[i].key) {
                                case '1':
                                    this.yellowKey++;
                                    tipString = '获得一把黄钥匙';
                                    this.showTip(cc.Color.BLACK, tipString);
                                    break;
                                case '2':
                                    this.blueKey++;
                                    tipString = '获得一把蓝钥匙';
                                    this.showTip(cc.Color.BLACK, tipString);
                                    break;
                                case '3':
                                    this.redKey++;
                                    tipString = '获得一把红钥匙';
                                    this.showTip(cc.Color.BLACK, tipString);
                                    break;
                                default:
                                    break;
                            };
                        } else if (this.props[i].DEF) {
                            this.DEF += parseInt(this.props[i].DEF);
                            
                        };
                        this.removeTile(this.propLayer, newTile);
                        this.updateInfo();
                    } else {
                        

                    };
                };
            };
        };

        let monsterGID = this.monsterLayer.getTileGIDAt(newTile);
        if (monsterGID) {
            let monsterProperties = this.tiledMap.getPropertiesForGID(monsterGID);
            if (!monsterProperties) {
                this.removeTile(this.monsterLayer,newTile);
            } else{
                for (let i = 0; i < this.monsters.length; i++) {
                    if (monsterProperties.type == this.monsters[i].name) {
                        let fightRound = this.calculateHP(this.monsters[i])[0];
                        let damage = this.calculateHP(this.monsters[i])[1];
                        this.onFight(newTile, this.monsters[i], fightRound, damage);

                    } else {
                        if (monsterProperties.type == 'npc_1') {
                            
                            let labelScript = this.talkPanel.getComponent('labelScript');
                            let talk = [];
                            talk[0] = '我也不知道该怎么出去，我只知道铁剑在5楼，铁盾在9楼，你最好先拿到它们。';
                            labelScript.talk = talk;
                            labelScript.game = this;
                            labelScript.tile = newTile;
                            this.isPanelActive = true;
                            this.talkPanel.active = true;
                        };

                    };
                };
                
            };

            return;
        };

        this.curTile = newTile;
        this.updatePlayerPos();
    },

    onFight: function (newTile, monster, fightRound, damage) {
        this.fightPanel.active = true;
        this.isPanelActive = true;
        cc.log(fightRound);

        this.fightPanel.getComponent('fightPanel').newTile = newTile;
        this.fightPanel.getComponent('fightPanel').monster = monster;

        let myTurn = true;
        let enemyTurn = false;
        let eHPData;
        let mHPData;

        let enemyHP = monster.HP;
        let enemyATK = monster.ATK;
        let enemyDEF = monster.DEF;
        let enemyFrame = this.monsterLayer.getTileAt(newTile).getSpriteFrame();
        this.enemyIcon.spriteFrame = enemyFrame;
        this.enemyHPData.string = enemyHP;
        this.enemyATKData.string = enemyATK;
        this.enemyDEFData.string = enemyDEF;

        let eachDamageToM = damage / fightRound;
        let eachDamageToE = Math.ceil(monster.HP / fightRound);

        this.myHPData.string = this.HP;
        this.myATKData.string = this.ATK;
        this.myDEFData.string = this.DEF;

        this.schedule(() => {
            if (myTurn){
                myTurn = false;
                enemyTurn = true;
                eHPData = this.enemyHPData.string - eachDamageToE;
                if (eHPData > 0) {
                    this.enemyHPData.string = eHPData;
                } else {
                    this.enemyHPData.string = 0;
                    this.HP -= damage;
                    this.coin += parseInt(monster.coin);
                    this.removeTile(this.monsterLayer, newTile);
                    this.fightPanel.active = false;
                    this.isPanelActive = false;
                    cc.director.getScheduler().unscheduleAllForTarget(this);
                };
                
            } else if (enemyTurn){
                myTurn = true;
                enemyTurn = false;
                mHPData = this.myHPData.string - eachDamageToM;
                cc.log(mHPData);
                if (mHPData > 0) {
                    this.myHPData.string = mHPData;
                } else {
                    this.myHPData.string = this.HP;
                    this.fightPanel.active = false;
                    this.isPanelActive = false;
                    let tipString = '打不过';
                    this.showTip(cc.Color.RED, tipString);
                    cc.director.getScheduler().unscheduleAllForTarget(this);
                };
            };
            this.updateInfo();
        }, 0.5, fightRound * 2);

        



        //this.removeTile(this.monsterLayer, newTile);
        //this.updateInfo();
    },

    quickFight: function (newTile, monster) {
        let damage = this.calculateHP(monster)[1];

        if (this.HP <= damage) {
            let tipString = '打不过';
            this.showTip(cc.Color.RED, tipString);
        } else {
            this.HP -= damage;
            this.coin += parseInt(monster.coin);
            this.removeTile(this.monsterLayer, newTile);
        };
        this.updateInfo();
    },

    calculateHP: function (monster) {
        let enemyHP = monster.HP;
        let enemyATK = monster.ATK;
        let enemyDEF = monster.DEF;
        if (this.ATK <= enemyDEF) {
            cc.log('you are died');
            return;
        } else {
            let fightRound = Math.floor(enemyHP / (this.ATK - enemyDEF));
            let damage = fightRound * (enemyATK - this.DEF);
            return [fightRound,damage];
        };
    },

    onKeyPressed: function (event, key) {
        if (this.isPanelActive){
            return;
        };
        let newTile = cc.p(this.curTile.x, this.curTile.y);

        let sprite = this.player.getComponent(cc.Sprite);
        if (key) {
            switch (key) {
                case 'up':
                    newTile.y--;
                    sprite.spriteFrame = this.playerSpriteFrames[0];
                    break;
                case 'down':
                    newTile.y++;
                    sprite.spriteFrame = this.playerSpriteFrames[1];
                    break;
                case 'left':
                    newTile.x--;
                    sprite.spriteFrame = this.playerSpriteFrames[2];
                    break;
                case 'right':
                    newTile.x++;
                    sprite.spriteFrame = this.playerSpriteFrames[3];
                    break;
            };
        } else {
            switch (event.keyCode) {
                case cc.KEY.up:
                    newTile.y--;
                    sprite.spriteFrame = this.playerSpriteFrames[0];
                    break;
                case cc.KEY.down:
                    newTile.y++;
                    sprite.spriteFrame = this.playerSpriteFrames[1];
                    break;
                case cc.KEY.left:
                    newTile.x--;
                    sprite.spriteFrame = this.playerSpriteFrames[2];
                    break;
                case cc.KEY.right:
                    newTile.x++;
                    sprite.spriteFrame = this.playerSpriteFrames[3];
                    break;
            };
        };
        
        this.tryMoveToNewTile(newTile);
    },

    showTip: function (color,string) {
        this.tip.active = true;
        this.tip.color = color;
        let tipLabel = this.tip.getComponent(cc.Label);
        this.tip.width = 10;
        tipLabel.string = string;
        this.begainShowTip = true;
        this.increase = true;
    },

    update: function (dt) {
        if (this.begainShowTip) {
            if (this.increase) {
                this.tip.width += 10;
                if (this.tip.width >= 280) {
                    this.increase = false;
                    this.decrease = true;
                };
            } else if (this.decrease) {
                this.time += dt;
                if (this.time >= 1) {
                    this.tip.width -= 10;
                    if (this.tip.width <= 11) {
                        this.time = 0;
                        this.tip.active = false;

                        this.begainShowTip = false;
                        this.increase = false;
                        this.decrease = false;
                    };
                };
            };
        };
    },

    saveData() {
        cc.sys.localStorage.setItem('barrierInfo', JSON.stringify(this.barrierInfo));
        cc.sys.localStorage.setItem('doorInfo', JSON.stringify(this.doorInfo));
        cc.sys.localStorage.setItem('propInfo', JSON.stringify(this.propInfo));
        cc.sys.localStorage.setItem('monsterInfo', JSON.stringify(this.monsterInfo));

        //存储主角信息以及位置
        let playerData = {
            HP: this.HP,
            ATK: this.ATK,
            DEF: this.DEF,
            coin: this.coin,
            yellowKey: this.yellowKey,
            blueKey: this.blueKey,
            redKey: this.redKey,
            floor:this.floor,
            curTile: this.curTile,

        };
        cc.sys.localStorage.setItem('playerData', JSON.stringify(playerData));
        

    },

    getData() {
        let barrierInfoString = cc.sys.localStorage.getItem('barrierInfo');
        this.barrierInfo = JSON.parse(barrierInfoString);
        let doorInfoString = cc.sys.localStorage.getItem('doorInfo');
        this.doorInfo = JSON.parse(doorInfoString);
        let propInfoString = cc.sys.localStorage.getItem('propInfo');
        this.propInfo = JSON.parse(propInfoString);
        let monsterInfoString = cc.sys.localStorage.getItem('monsterInfo');
        this.monsterInfo = JSON.parse(monsterInfoString);

        let playerDataString = cc.sys.localStorage.getItem('playerData');
        let playerData = JSON.parse(playerDataString);

        this.initPlayerData(playerData);
        this.loadTiledMap(this.floor);
    },

    initPlayerData(playerData) {
        this.HP = playerData.HP;
        this.ATK = playerData.ATK;
        this.DEF = playerData.DEF;
        this.coin = playerData.coin;
        this.yellowKey = playerData.yellowKey;
        this.blueKey = playerData.blueKey;
        this.redKey = playerData.redKey;
        this.floor = playerData.floor;
        this.curTile = playerData.curTile;
        this.isLoadData = true;

    },
});
