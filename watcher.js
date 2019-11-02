class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        //先保存一下老的值
        this.value = this.get()
    }

    getVal(vm,expr){
        //获取实例对应的数据
        expr = expr.split('.');
        return expr.reduce((prev,next)=>{
            return prev[next];
        },vm.$data)
    }
    get(){
        Dep.target = this;//当编译模板时会给每一个绑定数据的地方创建一个watcher实例，将该实例绑定到Dep类上
        let value = this.getVal(this.vm,this.expr)//当获取vm实例上的data数据时创建dep实例，保存观察者数组
        Dep.target = null;//然后销毁target属性，在编译下一个节点时再次绑定新值
        return value;
    }
    //更新方法cb回调
    update(){
        let newValue = this.getVal(this.vm,this.expr);
        let oldValue = this.value;
        if(newValue != oldValue){
            this.cb(newValue)
        }
    }
}