module.exports = {
    loadMonsterData(cb) {
        let url = 'monsters';
        cc.loader.loadRes(url, (err, data) => {
            if (err) {
                cc.error(err);
                return;
            };
            return cb(data);
        })
    },

    loadTmxAsset: function (index,cb) {
        let url = 'floor_' + index;
        cc.loader.loadRes(url, cc.TiledMapAsset, (err, tmxAsset) => {
            if (err) {
                cc.error(err);
                return;
            };
            return cb(tmxAsset);
        });
    },

    loadPropData(cb) {
        let url = 'props';
        cc.loader.loadRes(url, (err, data) => {
            if (err) {
                cc.error(err);
                return;
            };
            return cb(data);
        })
    },

};

