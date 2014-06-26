
/*
 *图片查看器组件
 */


/*图片查看器参数定义
interface IImageViewerOptions{
    wrpperEl:HTMLElement;                               图片元素的父元素
    imageEl:HTMLImageElement;                           图片元素DOM对象
    totalImageCount:number;                             需要展示的图片总数
    getImageSrcByIndex:(index:number)=>string;          按索引值获取图片地址
    minScrollDistance?:number;                          触发切换图片的最小滚动距离
    onloadingImage?:()=>void;                           加载图片时要执行的操作，比如加些loading效果什么的
    onloaded?:()=>void;                                 加载图片时要执行的操作，比如加些loading效果什么的
}*/

function ImageViewer(options) {
    this.imageEl = options.imageEl;
    this.initialize(options);
}

ImageViewer.prototype = {

    initialize:function(options) {
        this.options = options;
        this.currentImageIndex = 0;
        this.imageEl.src = this.options.getImageSrcByIndex(this.currentImageIndex);
        this.initEvents();
    },

    initEvents:function() {
        var self = this;

        if (!this.isSupportTouchEvents()) {
            this.initClickEvents();
        } else {
            this.initTouchEvents();
        }
        
        //图片加载成功后设置下当前图片相对视窗的初始信息
        this.imageEl.onload = function() {
            self.initBoundingRectInfo = this.getBoundingClientRect();   
            self.options.onloadedImage && self.options.onloadedImage();
        }
    },

    initClickEvents:function() {
        var self = this;

        this.imageEl.onclick = function(e) {
            var eventX = e.pageX;
            var boundingRectInfo = this.getBoundingClientRect();
            boundingRectInfo.width = boundingRectInfo.width || (boundingRectInfo.right - boundingRectInfo.left);

            var isClickedLeft = (eventX - boundingRectInfo.left) < (boundingRectInfo.width /2);
            var delta = isClickedLeft ? -1 : 1;
            self.loadAdjacentImage(delta);
        }
    },

    initTouchEvents:function() {
        var self = this;

        this.minScrollDistance = this.options.minScrollDistance || 20;
        new iScroll(this.options.wrapperEl,{
            zoom: true,
            zoomMin: 1,
            zoomMax: 4,
            doubleTapZoom: 2,
            useTransition: true,
            checkDOMChanges: false,
            hScrollbar: false,
            vScrollbar: false,
            onZoomStart: function() {
                return false;
            }
            //onScrollStart:function(e) {
                //self.touchStartX = e.touches[0].pageX;
            //},
            //onScrollMove: function(e) {
                //self.touchMoveX = e.touches[0].pageX;
            //},
            //onScrollEnd: function() {
                //if(self.isImageZoomed()){
                    //return;
                //}
                //var moveDistance = self.touchMoveX - self.touchStartX;
                //if (Math.abs(moveDistance) < self.options.minScrollDistance) {
                    //return;
                //}
                //var delta = moveDistance > 0 ? -1 : 1;
                //self.loadAdjacentImage(delta);
            //}
        });


        this.imageEl.ontouchstart = function(e) {
            self.touchStartX = e.touches[0].pageX;
        };

        this.imageEl.ontouchmove = function(e) {
            self.isMoving = true;
            self.touchMoveX = e.touches[0].pageX;
        };

        this.imageEl.ontouchend = function() {
            if (self.isMoving && !self.isImageZoomed()) {
                var moveDistance = self.touchMoveX - self.touchStartX;
                if (Math.abs(moveDistance) < self.options.minScrollDistance) {
                    return;
                }
                var delta = moveDistance > 0 ? -1 : 1;
                self.loadAdjacentImage(delta);
                self.isMoving = false;
            }
        }
    },

    /*
     *加载相邻的一张图片
     */
    loadAdjacentImage:function(delta) {
        var targetIndex = this.currentImageIndex + delta;
        if (targetIndex < 0 || targetIndex > this.options.totalImageCount) {
            return;
        }
        this.imageEl.src = this.options.getImageSrcByIndex(targetIndex);
        this.currentImageIndex += delta;
        this.options.onloadingImage && this.options.onloadingImage();
    },

    /*
     *判断图片是否处于缩放状态
     */
    isImageZoomed: function() {
        var boundingRectInfo = this.imageEl.getBoundingClientRect();   
        
        for(var key in boundingRectInfo){
            if(['top','bottom','right','left'].indexOf(key) > -1){
                if (boundingRectInfo[key] !== this.initBoundingRectInfo[key]) {
                    return true;
                }
            }
        }
        return false;
    },

    /*
     *判断是否是触摸设备
     */
    isSupportTouchEvents:function() {
        return document.hasOwnProperty("ontouchstart");
    }
}
