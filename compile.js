class Compile{
    constructor(el,vm){
        this.el = this.isElementNode(el)?el:document.querySelector(el);
        this.vm = vm;
        if(this.el){
            //如果能获取到元素，开始编译
            //1.先把真实的dom放到内存中 fragmanet
            let fragment = this.node2fragment(this.el);
            //2.编译想要元素节点(v-model)和文本节点({{}})
            this.compile(fragment);
            //3.把编译好的fragment放到页面中
            this.el.appendChild(fragment);
        }
    }
    /*辅助方法*/
    isElementNode(node){
        //判断是否是元素节点
        return node.nodeType === 1;
    }

    isDirective(name){
        //判断是否是指令
        if(new RegExp("^v-.*$").test(name)) {
           return true;
        }
    }
    /*核心方法*/
    compileElement(node){
        //检查元素上是否有v-model等属性
        let attrs = node.attributes;
        Array.from(attrs).forEach((attr)=>{
            //获取属性名称
            let attrName = attr.name;
            if(this.isDirective(attrName)){
                //将属性值放到节点中
                let expr = attr.value//属性值
                let type = attr.name.slice(2)//指令类型
                compileUtil[type](node,this.vm,expr)

            }
            
        })
    }
    compileText(node){
        //取文本中的内容
        let expr = node.textContent;
        let reg = /\{\{([^}]+)\}\}/g;
        if(reg.test(expr)){
            compileUtil['text'](node,this.vm,expr)
        }
    }
    compile(fragment){
        //编译模板
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach((node)=>{
            if(this.isElementNode(node)){
                //元素节点
                //编译元素
                this.compileElement(node)
                //还需要继续深入检查
                this.compile(node)
            }else{
                //文本节点
                //编译文本
                this.compileText(node)
            }
        })
    }
    node2fragment(el){
        //将el的内容全部放到内存中
        let fragment = document.createElement('fragment');
        let firstChild;
        while(firstChild = el.firstChild){
            fragment.appendChild(el.firstChild)
        }
        return fragment;
    }
    
}
//编译方法
compileUtil={
    getVal(vm,expr){
        //获取实例对应的数据
        expr = expr.split('.');
        return expr.reduce((prev,next)=>{
            return prev[next];
        },vm.$data)
    },
    getTextVal(vm,expr){
        return expr.replace(/\{\{([^}]+)\}\}/g,(...arg)=>{
            return this.getVal(vm,arg[1])
        })
    },
    setVal(vm,expr,value){
        expr=expr.split('.');
        expr.reduce((prev,next,currentIndex)=>{
            if(currentIndex == expr.length-1){
                return prev[next] = value;
            }
            return prev[next];
        },vm.$data)
    },
    text(node,vm,expr){//文本处理
        let updateFn = this.updater['textUpdater'];
        let value = this.getTextVal(vm,expr)
        //第一次编译更新文本内容
        updateFn && updateFn(node,value)
        //加入观察者，监控数据变化，给每一个文本添加一个whatcher
        expr.replace(/\{\{([^}]+)\}\}/g,(...arg)=>{
            new Watcher(vm,arg[1],(newValue)=>{
                //如果文本节点中的数据变化了，需要从新获取其依赖的数据，更新文本中的内容
                updateFn && updateFn(node,this.getTextVal(vm,expr))
            })
        })
    },
    model(node,vm,expr){//输入框处理
        let updateFn = this.updater['modelUpdater']
        //第一次编译更新文本框内容
        updateFn && updateFn(node,this.getVal(vm,expr))
        //加入观察者，监控数据变化,创建whatcher实例
        new Watcher(vm,expr,(newValue)=>{
            updateFn && updateFn(node,this.getVal(vm,expr))
        })
        //input添加监听，改变数据
        node.addEventListener('input',(e)=>{
            this.setVal(vm,expr,e.target.value)
        })
    },
    updater:{
        //文本更新
        textUpdater(node,value){
            node.textContent = value;
        },
        //输入框更新
        modelUpdater(node,value){
            node.value = value;
        }
    }
}