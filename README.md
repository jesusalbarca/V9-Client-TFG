# IXCI - grpc

Authors:
Alejandro Rey López y Jesús Albarca Gordillo

Web application aimed at facilitating the definition of functions that are to be executed in a remote end. This project
has been created with VR experiments in mind, allowing researchers to define their custom remote control functions to
configure and manage the lifecycle of the experiment.

# Usage

The web application allows you to define your remote functions using a GUI. To do so, you need to define 3 components:

- Create messages (these constitute the parameters and return type of the function).
- Create a service (a logically grouped set of functions)
- Define the functions themselves (including the name of the function, return type and parameters - both Messages - )

After the creation of the definition of the elements of the remote calls, a .proto file is generated, which is to be
shared with the receiving end. This file can be compiled in the receiving end (E.g., a Unity VR application) and code
for the target programming language will be automatically generated.

After that, all that is left to do is to define the actual desired behaviour of the remote calls and binding the
implementation with the auto-generated code.

Once all of this is done, we can call the functions from the "Execute Services" panel.

# Endpoints

# Working on

<svg fill="none" viewBox="0 0 600 300" width="600" height="300" xmlns="http://www.w3.org/2000/svg">
<foreignObject width="100%" height="100%">
<div xmlns="http://www.w3.org/1999/xhtml">
                    <div id="donate-button-container">
                        <div id="donate-button"></div>
                        <script src="https://www.paypalobjects.com/donate/sdk/donate-sdk.js" charset="UTF-8"></script>
                        <script>
                            PayPal.Donation.Button({
                                env: 'production',
                                hosted_button_id: 'ZXNT35QYY9NQS',
                                image: {
                                    src: 'https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif',
                                    alt: 'Donate with PayPal button',
                                    title: 'PayPal - The safer, easier way to pay online!',
                                }
                            }).render('#donate-button');
                        </script>
                    </div>
</div>
</foreignObject>
</svg>

## Imprescindibles

- Crear un servicio que permita pasar el id del participante
- Crear un servicio que permita configurar el orden de presentación de las condiciones experimentales.
- Botón de terminar el experimento
- Que el botón de eliminar te pida confirmación
- Evitar que se sobreescriba el archivo proto.
- Añadir un campo a los mensajes en base de datos que indique si un mensaje es complejo o no.

## Improvements

- Determinar cuándo y cómo se insertan cosas en la base de datos.
- HAcer que el servicio
- Añadir soporte para otros tipos de datos y nesting
  https://developers.google.com/protocol-buffers/docs/proto3#simple

## To Do

- Permitir cambiar nombre del paquete generado desde GUI /Configurar en general desde la GUI
- No se tienen en cuenta las dependencias entre servicios/mensajes/rpcs
- No envía correctamente booleans (sale siempre true) -> ARREGLADO
- Cada vez que se ejecuta un servicio, vuelve al home !!!  (arreglado)
- Permitir duplicar protofile
- Permitir especificar el nombre del paquete desde la GUI o desde línea de comandos.
- no crear archivo proto si es igual al que ya existe.
- Ya lee del protofile.proto (lo único que hay que reiniciar el server)
- Support streaming