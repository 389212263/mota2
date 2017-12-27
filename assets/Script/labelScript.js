cc.Class({
    extends: cc.Component,

    properties: {
        label: cc.Label,
        talk: {
            default: [],
            serializable:false,
        },
    },

    // use this for initialization
    onLoad: function () {
        this.index = 0;
    },

    onKeyDown: function () {
        this.node.active = false;
        this.gameScript.isPanelActive = false;
        this.game.removeTile(this.game.monsterLayer, this.tile);
    },

    onEnable: function () {
        this.node.on('touchstart', this.onBtnPressed, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.gameScript = this.node.parent.getComponent('game');
        this.changeLabelString();
    },

    onDisable: function () {
        this.node.off('touchstart', this.onBtnPressed, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.index = 0;
        this.talk = [];
    },

    onBtnPressed: function (event) {
        event.stopPropagation();
        this.index++;
        this.changeLabelString();
    },

    changeLabelString: function () {
        this.label.string = this.talk[this.index];
        if (this.index >= this.talk.length){
            this.node.active = false;
            this.gameScript.isPanelActive = false;
            this.game.removeTile(this.game.monsterLayer, this.tile);
        };
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
