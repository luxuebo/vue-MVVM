class MVVM{
    constructor(options){
        //把参数挂载到实例上
        this.$el = options.el;
        this.$data = options.data;

        //如果有要编译的模板就开始编译
        if(this.$el){
            //数据劫持，把data的所有属性改为get和set
            new Observer(this.$data);
            //添加代理，在vm实例上直接通过vm.data也能访问
            this.proxyData(this.$data)
            //模板编译
            new Compile(this.$el,this);
        }
    }
    proxyData(data){
        Object.keys(data).forEach((key)=>{
            Object.defineProperty(this,key,{
                enumerable:true,
                configurable:true,
                get(){
                    return data[key]
                },
                set(newValue){
                    data[key] = newValue;
                }
            })
        })
    }
}