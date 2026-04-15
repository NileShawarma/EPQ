class Stack:
    def __init__(self):
        self.stack = []
        self.stack_size = 0

    def push(self, item):
        self.stack.append(item)
        self.stack_size += 1

    def peek(self):
        if self.stack_size == 0:
            raise IndexError("Stack is empty!")
        
        return self.stack[-1]
    
    def pop(self):
        if self.stack_size == 0:
            raise IndexError("Stack is empty!")
        
        self.stack_size -= 1
        return self.stack.pop(-1)
    
    def is_empty(self):
        return self.stack_size==0

    def output(self):
        return ",".join(str(item) for item in self.stack)

if __name__ == "__main__":
    my_stack = Stack()
    my_stack.push("6")
    print(my_stack.peek())
    print(my_stack.pop())
    print(my_stack.output())
    my_stack.push("6")
    my_stack.push("7")
    print(my_stack.peek())