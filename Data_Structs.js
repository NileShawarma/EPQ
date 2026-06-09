class Stack {
    constructor() {
        this.stack = [];
        this.stack.length = 0;
    }

    push(item){
        this.stack.push(item);
    }

    peek(){
        if (this.stack.length == 0){
            console.error("Stack is empty!");            
        }

        return this.stack.at(-1);
    }

    pop(){
        if (this.stack.length == 0){
            console.error("Stack is empty!");
        }

        return this.stack.pop()
    }

    is_empty(){
        return (this.stack.length == 0)
    }

    reverse(){
        this.stack.reverse()
    }
}