import tornado, tornado.websocket
import threading
import numpy as np
import time

class EchoWebSocket(tornado.websocket.WebSocketHandler):
    t = time.clock()
    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        print message
        # self.write_message(u"You said: " + message.upper())
        if message.lower() == 'senddata':
            self.send_data()
    
    def send_data(self):
        x = np.linspace(0, 1, 64)
        X, Y = np.meshgrid(x, x)
        Z = 0.1*np.sin(np.pi * X + self.t / 2) * np.sin(2*np.pi * Y + self.t / 4)
        data = np.column_stack((X.ravel(), Y.ravel(), Z.ravel(), Z.ravel(), Z.ravel(), Z.ravel(), Z.ravel()))
        self.write_message(data.astype(np.float32).tobytes(), binary=True)
        self.t = time.clock()

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
