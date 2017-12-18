const DataManager = require('DataManager');
cc.Class({
    extends: cc.Component,

    properties: {
        infoPanel: cc.Node,
        buttonPanel: cc.Node,

        yellowKeyLabel:cc.Label,
        blueKeyLabel:cc.Label,
        redKeyLabel: cc.Label,

        floorLabel: cc.Label,

        HPLabel: cc.Label,
        ATKLabel: cc.Label,
        DEFLabel: cc.Label,
        coinLabel: cc.Label,


        playerSpriteFrame: cc.SpriteFrame,
        upFloor: true,

        HP: {
            default: 100,
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
        }
    },
    aaaa: function () {
        cc.log(1234);
    },

    onLoad: function () {
        this.tmxAssets = [];
        this.barrierInfo = [];
        this.doorInfo = [];
        this.propInfo = [];
        this.monsterInfo = [];

        DataManager.loadMonsterData( ()=> {
            this.aaaa();

        });

        this.floor = 1;
        //this.createTiledMap();
        //this.loadTmxAsset(this.floor);

        //this.initPanel();
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
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

    loadTmxAsset: function (index) {
        if (this.tmxAssets[index - 1]) {
            this.floor = index;
            this.tiledMap.tmxAsset = this.tmxAssets[index - 1];
            this.initTiledMap();
            cc.log('have tmxAsset');
            cc.log(index);
        } else {
            let url = 'floor_' + index;
            cc.loader.loadRes(url, cc.TiledMapAsset, (err, tmxAsset) => {
                if (err) {
                    cc.error(err);
                    return;
                };
                this.tmxAssets.push(tmxAsset);
                this.tiledMap.tmxAsset = tmxAsset;

                this.initTiledMap();
                this.floor = index;
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
        this.player.setAnchorPoint(0, 0);
        this.player.setLocalZOrder(10);
        let sprite = this.player.addComponent(cc.Sprite);
        sprite.spriteFrame = this.playerSpriteFrame;
    },

    initTiledMap: function () {
        let mapSize = this.tiledMapNode.getContentSize();
        this.tiledMapNode.setPosition(-mapSize.width / 2, -mapSize.height / 2);

        this.floorLayer = this.tiledMap.getLayer(this.floorLayerName);
        this.barrierLayer = this.tiledMap.getLayer(this.barrierLayerName);
        this.doorLayer = this.tiledMap.getLayer(this.doorLayerName);
        this.propLayer = this.tiledMap.getLayer(this.propLayerName);
        this.monsterLayer = this.tiledMap.getLayer(this.monsterLayerName);
        for (let i = 0; i < this.barrierInfo.length; i++) {
            this.barrierLayer.removeTileAt(this.barrierInfo[i]);
        };
        for (let i = 0; i < this.doorInfo.length; i++) {
            this.doorLayer.removeTileAt(this.doorInfo[i]);
        };
        for (let i = 0; i < this.propInfo.length; i++) {
            this.propLayer.removeTileAt(this.propInfo[i]);
        };
        for (let i = 0; i < this.monsterInfo.length; i++) {
            this.monsterLayer.removeTileAt(this.monsterInfo[i]);
        };

        let objectGroup = this.tiledMap.getObjectGroup(this.objectGroupName);
        let startObj = objectGroup.getObject(this.startObjectName);
        let endObj = objectGroup.getObject(this.successObjectName);
        if (!startObj || !endObj) return;

        let startPos = cc.p(startObj.sgNode.x, startObj.sgNode.y);
        let endPos = cc.p(endObj.sgNode.x, endObj.sgNode.y);

        this.startTile = this.getTilePos(startPos);
        this.endTile = this.getTilePos(endPos);

        if (this.upFloor) {
            this.curTile = this.startTile;
        } else {
            this.curTile = this.endTile;
        };
        this.updatePlayerPos(this.curTile);
    },

    updatePlayerPos: function () {
        let posInPixel = this.floorLayer.getPositionAt(this.curTile);
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
            this.barrierInfo.push(newTile);
        } else if (layer == this.doorLayer){
            this.doorInfo.push(newTile);

        } else if (layer == this.propLayer){
            this.propInfo.push(newTile);

        } else if (layer == this.monsterLayer) {
            this.monsterInfo.push(newTile);

        };

        layer.removeTileAt(newTile);

    },
    updateKey: function () {
        this.yellowKeyLabel.string = this.yellowKey;
        this.blueKeyLabel.string = this.blueKey;
        this.redKeyLabel.string = this.redKey;
    },
    updateHP: function () {
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
                this.loadTmxAsset(nextFloor);
                this.floorLabel.string = '第' + nextFloor + '层';

            } else if (barrierProperties.type == 'DownStair') {
                cc.log('downstair');
                this.upFloor = false;
                let nextFloor = this.floor - 1;
                this.loadTmxAsset(nextFloor);
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
                    return;
                };
            } else if (doorProperties.type == 'blue_door') {
                if (this.blueKey > 0) {
                    cc.log('blue_key - 1');
                    this.blueKey--;
                this.removeTile(this.doorLayer,newTile);
                } else {
                    cc.log('have no blue_key');
                    return;
                };
            } else if (doorProperties.type == 'red_door') {
                if (this.redKey > 0) {
                    cc.log('red_key - 1');
                    this.redKey--;
                this.removeTile(this.doorLayer,newTile);
                } else {
                    cc.log('have no red_key');
                    return;
                };
            } else if (doorProperties.type == 'guard_door') {
                cc.log('red_key + 1');
                this.removeTile(this.doorLayer,newTile);
            };
            this.updateKey();
        };

        let propGID = this.propLayer.getTileGIDAt(newTile);
        if (propGID) {
            let propProperties = this.tiledMap.getPropertiesForGID(propGID);
            if (!propProperties) {
                this.removeTile(this.propLayer,newTile);
            } else if (propProperties.type == 'yellow_key') {
                cc.log('yellow_key + 1');
                this.yellowKey++;
                this.removeTile(this.propLayer, newTile);
                this.updateKey();
            } else if (propProperties.type == 'blue_key') {
                cc.log('blue_key + 1');
                this.blueKey++;
                this.removeTile(this.propLayer, newTile);
                this.updateKey();
            } else if (propProperties.type == 'red_key') {
                cc.log('red_key + 1');
                this.redKey++;
                this.removeTile(this.propLayer, newTile);
                this.updateKey();
            } else if (propProperties.type == 'red_blood') {
                cc.log('blood + 500');
                this.HP += 500;
                this.removeTile(this.propLayer, newTile);
                this.updateHP();
            } else if (propProperties.type == 'blue_blood') {
                cc.log('blood + 1000');
                this.HP += 1000;
                this.removeTile(this.propLayer, newTile);
                this.updateHP();
            } else {
                this.removeTile(this.propLayer,newTile);
            };
        };

        let monsterGID = this.monsterLayer.getTileGIDAt(newTile);
        if (monsterGID) {
            let monsterProperties = this.tiledMap.getPropertiesForGID(monsterGID);
            if (!monsterProperties) {
                this.removeTile(this.monsterLayer,newTile);
            } else if (monsterProperties.type == 'npc') {
                cc.log('npc');
            } else if (monsterProperties.type == 'blue_door') {
                if (this.blueKey > 0) {
                    cc.log('blue_key - 1');
                    this.blueKey--;
                this.removeTile(this.monsterLayer,newTile);
                } else {
                    cc.log('have no blue_key');
                    return;
                };
            } else if (monsterProperties.type == 'red_door') {
                if (this.redKey > 0) {
                    cc.log('red_key - 1');
                    this.redKey--;
                this.removeTile(this.monsterLayer,newTile);
                } else {
                    cc.log('have no red_key');
                    return;
                };
            } else if (monsterProperties.type == 'guard_door') {
                cc.log('red_key + 1');
                this.removeTile(this.monsterLayer,newTile);
            };

            return;
        };

        this.curTile = newTile;
        this.updatePlayerPos();
    },

    onKeyPressed: function (event, key) {
        let newTile = cc.p(this.curTile.x, this.curTile.y);
        cc.log(event.type);
        if (key) {
            switch (key) {
                case 'up':
                    newTile.y--;
                    break;
                case 'down':
                    newTile.y++;
                    break;
                case 'left':
                    newTile.x--;
                    break;
                case 'right':
                    newTile.x++;
                    break;
            };
        } else {
            switch (event.keyCode) {
                case cc.KEY.up:
                    newTile.y--;
                    break;
                case cc.KEY.down:
                    newTile.y++;
                    break;
                case cc.KEY.left:
                    newTile.x--;
                    break;
                case cc.KEY.right:
                    newTile.x++;
                    break;
            };
        };
        
        this.tryMoveToNewTile(newTile);
    },

    leave: function () {
        cc.game.end();
    },
    // update: function (dt) {

    // },
});
