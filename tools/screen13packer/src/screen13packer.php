<?php



$gestor_dir = opendir("./");
while (false !== ($nombre_fichero = readdir($gestor_dir))) {
    $ficheros[] = $nombre_fichero;
}
 

foreach($ficheros as $filename){
    $nombre=explode(".",$filename);
    if($nombre[1]=="txt")    {

                
                $nombre=$nombre[0];
                $fp = fopen( $filename, 'r' );
                $file_contents = @fread( $fp, filesize( $filename ) );
                fclose( $fp );

                $lines = explode("\n", $file_contents);
                $numlines = count($lines);

                $resultado='{"frames": {'."\n";

                for ($i = 0; $i < $numlines-1; $i++) { 
                    $cachos=explode(" ",$lines[$i]);
                    $resultado=$resultado.'"'.$cachos[0].'.png":{'."\n";
                    $resultado=$resultado.'"frame": {"x":'.$cachos[2].',"y":'.$cachos[3].',"w":'.$cachos[4].',"h":'.$cachos[5].''."\n";
                    $resultado=$resultado.'},'."\n";
                    $resultado=$resultado.'"rotated":false,'."\n";
                    $resultado=$resultado.'"trimmed":false,'."\n";
                    $resultado=$resultado.'"spriteSourceSize": {"x":'.$cachos[2].',"y":'.$cachos[3].',"w":'.$cachos[4].',"h":'.$cachos[5].''."\n";
                    $resultado=$resultado.'},'."\n";
                    $resultado=$resultado.'"sourceSize": {"w":'.$cachos[4].',"h":'.$cachos[5].''."\n";
                    $resultado=$resultado.'}'."\n";
                    if($i == $numlines-2){
                      $resultado=$resultado.'}'."\n";
                    }else{
                      $resultado=$resultado.'},'."\n";
                    }
                }

                $resultado=$resultado.'},"meta": {'."\n";
                $resultado=$resultado.'  "app": "Screen13Packer",'."\n";
                $resultado=$resultado.'  "version": "1.0",'."\n";
                $resultado=$resultado.'  "image": "'.$nombre.'.png",'."\n";
                $resultado=$resultado.'  "format": "RGBA8888",'."\n";
                $resultado=$resultado.'  "size": {"w":1024,"h":1024}, '."\n";
                $resultado=$resultado.'  "scale": "1"'."\n";
                $resultado=$resultado.'}'."\n";
                $resultado=$resultado.'}'."\n";


                $filename = $nombre.'.json';
                $fp = fopen( $filename, 'w' );
                fwrite( $fp, $resultado );
                fclose( $fp );


    }
}




?>