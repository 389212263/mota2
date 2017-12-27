cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        this.gameScript = this.node.parent.getComponent('game');
    },

    onEnable: function () {
        this.node.on('touchstart', this.onTouch, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    onDisable: function () {
        this.node.off('touchstart', this.onTouch, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    onKeyDown: function () {
        this.node.active = false;
        this.gameScript.isPanelActive = false;
        cc.director.getScheduler().unscheduleAllForTarget(this.gameScript);
        this.gameScript.quickFight(this.newTile, this.monster);
    },

    onTouch: function (event) {
        event.stopPropagation();
    },

    onBtnPressed: function (event,data) {
        if (data == 'yes') {
            cc.game.end();
            cc.log('yes');
        } else if (data == 'no') {
            this.node.active = false;
            this.gameScript.isPanelActive = false;

            cc.log('no');
        } else if (data == 'leave') {
            this.node.active = true;
            this.gameScript.isPanelActive = true;
        } else if (data == 'leaveFight') {
            this.node.active = false;
            this.gameScript.isPanelActive = false;
            cc.director.getScheduler().unscheduleAllForTarget(this.gameScript);
            this.gameScript.quickFight(this.newTile, this.monster);

        };
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
