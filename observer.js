class Observer{
    constructor(data){
       this.observe(data)
    }
    observe(data){
        //将data中原有对象属性改成get和set形式
        if(Object.prototype.toString.call(data) !='[object Object]'){
            //如果data不是对象，则不劫持
            return;
        }

        //获取data对象的key和value
        Object.keys(data).forEach((key)=>{
            //劫持
            this.defineReactive(data,key,data[key]);
            this.observe(data[key]);//深度递归劫持
        })
    }
    //定义响应式
    defineReactive(data,key,value){
        let that = this;
        let dep = new Dep();//给每一个属性创建一个数组
        Object.defineProperty(data,key,{
            enumerable:true,//可枚举
            configurable:true,//可操作（删除）
            get(){
                Dep.target && dep.addSub(Dep.target)//添加该属性绑定视图的观察者
                return value;
            },
            set(newValue){
                if(newValue !=value){
                    that.observe(newValue);//如果设置的新值是对象还需要在进行劫持
                    value = newValue;
                    dep.notify()//数据改变，通知所有的视图更新
                }
            }
        })
    }
}

class Dep{
    constructor(){
        this.subs = [];//订阅数组
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach((watcher)=>{
            watcher.update();
        })
    }
}