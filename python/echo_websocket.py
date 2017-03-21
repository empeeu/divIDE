import tornado, tornado.websocket
import threading

class EchoWebSocket(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        print message
        self.write_message(u"You said: " + message.upper())
    
    def on_close(self):
        print("WebSocket closed")

    def check_origin(self, origin):
        return True

def start_tornado():
    def start_loop():
        tornado.ioloop.IOLoop.instance().start()
    t = threading.Thread(target=start_loop)
    t.daemon = True
    t.start()

def stop_tornado():
    tornado.ioloop.IOLoop.instance().stop()

if __name__ == '__main__':
    port = 8888
    handlers = [
        (r'/ws', EchoWebSocket),
    ]
    app = tornado.web.Application(handlers)
    app.listen(port)
    start_tornado()
