//  Basado en un trabajo Public-domain by Darel Rex Finley, 2006.

function pointInPolygonSet(testX, testY, allPolys) {

  var oddNodes=false ;
  var polyI, i, j ;

  for (polyI=0; polyI<allPolys.length; polyI++) {
    for (i=0;    i< allPolys[polyI].length; i++) {
      j=i+1; if (j==allPolys[polyI].length) j=0;
      if   ( allPolys[polyI][i].y< testY
      &&     allPolys[polyI][j].y>=testY
      ||     allPolys[polyI][j].y< testY
      &&     allPolys[polyI][i].y>=testY) {
        if ( allPolys[polyI][i].x+(testY-allPolys[polyI][i].y) /   (allPolys[polyI][j].y  -allPolys[polyI][i].y)*   (allPolys[polyI][j].x       -allPolys[polyI][i].x)<testX) {
          oddNodes=!oddNodes; }}}}

  return oddNodes; }


function lineInPolygonSet(testSX, testSY, testEX, testEY, allPolys) {

  var theCos, theSin, dist, sX, sY, eX, eY, rotSX, rotSY, rotEX, rotEY, crossX;
  var i, j, polyI;

  testEX-=testSX;
  testEY-=testSY;
  dist=Math.sqrt(testEX*testEX+testEY*testEY);
  theCos =testEX/ dist;
  theSin =testEY/ dist;

  for (polyI=0; polyI<allPolys.length; polyI++) {
    for (i=0;    i< allPolys[polyI].length; i++) {
      j=i+1; if (j==allPolys[polyI].length) j=0;

      sX=allPolys[polyI][i].x-testSX;
      sY=allPolys[polyI][i].y-testSY;
      eX=allPolys[polyI][j].x-testSX;
      eY=allPolys[polyI][j].y-testSY;
      if (sX==0 && sY==0 && eX==testEX && eY==testEY
      ||  eX==0 && eY==0 && sX==testEX && sY==testEY) {
        return true; }

      rotSX=sX*theCos+sY*theSin;
      rotSY=sY*theCos-sX*theSin;
      rotEX=eX*theCos+eY*theSin;
      rotEY=eY*theCos-eX*theSin;
      if (rotSY<0 && rotEY>0
      ||  rotEY<0 && rotSY>0) {
        crossX=rotSX+(rotEX-rotSX)*(0-rotSY)/(rotEY-rotSY);
        if (crossX>=0 && crossX<=dist) return false; }

      if ( rotSY==0   && rotEY==0
      &&  (rotSX>=0   || rotEX>=0  )
      &&  (rotSX<=dist || rotEX<=dist)
      &&  (rotSX< 0   || rotEX< 0
      ||   rotSX> dist || rotEX> dist)) {
        return false; }}}

  return pointInPolygonSet(testSX+testEX/2,testSY+testEY/2,allPolys); }



function calcDist( sX,  sY,  eX,  eY) {
  eX-=sX; eY-=sY; return Math.sqrt(eX*eX+eY*eY);
}



function shortestPath( sX,  sY,  eX,  eY,  allPolys) {

  var  INF= 9999999;    //  (larger than total solution dist could ever be)

  var  pointList=Array(1000) ;   //  (enough for all polycorners plus two)
  for(i=0; i<pointList.length;i++){
  	pointList[i]=new PIXI.Point(0,0);

  }
  var  pointCount;
  var  tmpPoint;

  var  treeCount, polyI, i, j, bestI, bestJ ;
  var  bestDist, newDist ;

  var solucion={};
  solucion.encontrado=false;
  solucion.solutionX=[];
  solucion.solutionY=[];

  //  Fail if either the startpoint or endpoint is outside the polygon set.
  if (!pointInPolygonSet(sX,sY,allPolys)|| !pointInPolygonSet(eX,eY,allPolys)) {
    solucion.encontrado=false;
    return solucion;
  }

  //  If there is a straight-line solution, return with it immediately.
  if (lineInPolygonSet(sX,sY,eX,eY,allPolys)) {
    solutionNodes=0;
    solucion.encontrado=true;
    return solucion;
  }

  //  Build a point list that refers to the corners of the
  //  polygons, as well as to the startpoint and endpoint.
  pointList[0].x=sX;
  pointList[0].y=sY; 
  pointCount=1;
  for (polyI=0; polyI<allPolys.length; polyI++) {
    for (i=0; i<allPolys[polyI].length; i++) {
      pointList[pointCount].x=allPolys[polyI][i].x;
      pointList[pointCount].y=allPolys[polyI][i].y; pointCount++; }}
  pointList[pointCount].x=eX;
  pointList[pointCount].y=eY;
  pointCount++;

  //  Initialize the shortest-path tree to include just the startpoint.
  treeCount=1;
  pointList[0].totalDist=0;

  //  Iteratively grow the shortest-path tree until it reaches the endpoint
  //  -- or until it becomes unable to grow, in which case exit with failure.
  bestJ=0;
  while (bestJ<pointCount-1) {
    bestDist=INF;
    for (i=0; i<treeCount; i++) {
      for (j=treeCount; j<pointCount; j++) {
        if (lineInPolygonSet(pointList[i].x,pointList[i].y,pointList[j].x,pointList[j].y,allPolys)) {
          newDist=pointList[i].totalDist+calcDist(pointList[i].x,pointList[i].y,pointList[j].x,pointList[j].y);
          if (newDist<bestDist) {
            bestDist=newDist; bestI=i; bestJ=j; }}}}
    if (bestDist==INF) {
        solucion.encontrado=false;
        return solucion;
    }
    pointList[bestJ].prev     =bestI   ;
    pointList[bestJ].totalDist=bestDist;

    tmpPoint=pointList[bestJ];
    pointList[bestJ]=pointList[treeCount];
    pointList[treeCount]=tmpPoint;
    
    treeCount++; }

  //  Load the solution arrays.
  solutionNodes= -1; i=treeCount-1;
  while (i> 0) {
    i=pointList[i].prev; solutionNodes++; }
  j=solutionNodes-1; i=treeCount-1;
  while (j>=0) {
    i=pointList[i].prev;
    solucion.solutionX[j]=pointList[i].x;
    solucion.solutionY[j]=pointList[i].y; j--; }

  //  Success.
  solucion.encontrado=true;
  return solucion;
}
  

function lineaMasCercana(xp,yp,allPolys){
    var  INF= 9999999;    //  (larger than total solution dist could ever be)

    var poliI, i, j;
    var bestDist=INF;
    var newDist=INF;
    var newPoint=new PIXI.Point(0,0);
    var bestPoint=new PIXI.Point(0,0);

    for (polyI=0; polyI<allPolys.length; polyI++) {
        for (i=0;    i< allPolys[polyI].length; i++) {
          j=i+1; if (j==allPolys[polyI].length) j=0;
              x1=allPolys[polyI][i].x;
              y1=allPolys[polyI][i].y;
              x2=allPolys[polyI][j].x;
              y2=allPolys[polyI][j].y;
              newPoint = puntoMasCercano(xp,yp,x1,y1,x2,y2);
              newDist = Math.sqrt(Math.pow(xp-newPoint.x,2) + Math.pow(yp-newPoint.y,2));
              if(newDist<bestDist){
                bestDist=newDist;
                bestPoint = newPoint;
              }
       }//for
    }//for
    return bestPoint;
}

function puntoMasCercano(x, y, x1, y1, x2, y2) {

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  //return Math.sqrt(dx * dx + dy * dy);
  return new PIXI.Point(xx,yy);
}
function distanciaALinea(x, y, x1, y1, x2, y2) {

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
  //return new PIXI.Point(xx,yy);
}