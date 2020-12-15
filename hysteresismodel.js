function clough(ds,dd,fs,ss,hyst,hctrl){
    let dy=hyst.dy, fy=hyst.fy, sy=hyst.sy, su=hyst.su, b0=hyst.b0;
    let ll=hctrl.ll, s1=hctrl.s1, d0=hctrl.d0, x0=hctrl.x0, x1=hctrl.x1, fm=hctrl.fm, dm=hctrl.dm, ff=hctrl.ff;
    let is=0, sn=0;
    if(!isNaN(dy)){
        dy=[-dy,dy];
        fy=[-fy,fy];
    }
    if(fs<0){
        is=0;
        sn=-1;
    }else{
        is=1;
        sn=1;
    }
    switch(ll){
        case 1:
            if(dd<0){
                is=0;
                sn=-1;
            }
            else{
                is=1;
                sn=1;
            }
            if((dy[is]-dd)*sn>0) ff=sy*dd;
            else{
                dm=dy;
                fm=fy;
                s1=[sy,sy];
                ll=2;
                ss=su;
                ff=fy[is]+(dd-dy[is])*su;
            }
            break;
        case 2:
            if((dd-ds)*sn>0) ff=fy[is]+su*(dd-dy[is]);
            else{
                dm[is]=ds;
                fm[is]=fs;
                s1[is]=sy*(dy[is]/dm[is])**b0;
                x0    =ds-fs/s1[is];
                if((x0-dd)*sn <0){
                    ll = 3;
                    ss = s1[is];
                    ff = ss*(dd-x0);
                }else{
                    is = 1-is;
                    sn = -sn;
                    if((dm[is]-dd)*sn >0){
                        ll = 4;
                        ss = fm[is]/(dm[is]-x0);
                        ff = ss*(dd-x0);
                    }else{
                        ll = 2;
                        ss = su;
                        ff = fy[is]+su*(dd-dy[is]);
                    }
                }
            }
            break;
        case 3:
            if((x0-dd)*sn <0){
                if((dm[is]-dd)*sn >0) ff = ss*(dd-x0);
                else{
                    ll = 2;
                    ss = su;
                    ff = fy[is]+su*(dd-dy[is]);
                }
            }else{
                is = 1-is;
                sn = -sn;
                if((dm[is]-dd)*sn >0){
                    ll = 4;
                    ss = fm[is]/(dm[is]-x0);
                    ff = ss*(dd-x0);
                }else{
                    ll = 2;
                    ss = su;
                    ff = fy[is]+su*(dd-dy[is]);
                }
            }
            break;
        case 4:
            if((dd-ds)*sn >0){
                if((dm[is]-dd)*sn >0) ff = ss*(dd-x0);
                else{
                    ll = 2;
                    ss = su;
                    ff = fy[is]+su*(dd-dy[is]);
                }
            }else{
                d0 = ds;
                x1 = ds-fs/s1[is];
                if((x1-dd)*sn <0){
                    ll = 5;
                    ss = s1[is];
                    ff = ss*(dd-x1);
                }else{
                    is = 1-is;
                    sn = -sn;
                    x0 = x1;
                    if((dm[is]-dd)*sn >0){
                        ll = 4;
                        ss = fm[is]/(dm[is]-x0);
                        ff = ss*(dd-x0);
                    }else{
                        ll = 2;
                        ss = su;
                        ff = fy[is]+su*(dd-dy[is]);
                    }
                }
            }
            break;
        case 5:
            if((x1-dd)*sn <0){
                if((d0-dd)*sn >0) ff = ss*(dd-x1);
                else{
                    if((dm[is]-dd)*sn >0){
                        ll = 4;
                        ss = fm[is]/(dm[is]-x0);
                        ff = ss*(dd-x0);
                    }else{
                        ll = 2;
                        ss = su;
                        ff = fy[is]+su*(dd-dy[is]);
                    }
                }
            }else{
                is = 1-is;
                sn = -sn;
                x0 = x1;
                if((dm[is]-dd)*sn >0){
                    ll = 4;
                    ss = fm[is]/(dm[is]-x0);
                    ff = ss*(dd-x0);
                }else{
                    ll = 2;
                    ss = su;
                    ff = fy[is]+su*(dd-dy[is]);
                }
            }
            break;
        default:console.log("ll=6");
    }
    hctrl.ll=ll;
    hctrl.s1=s1;
    hctrl.d0=d0;
    hctrl.x0=x0;
    hctrl.x1=x1;
    hctrl.fm=fm;
    hctrl.dm=dm;
    hctrl.ss=ss;
    hctrl.ff=ff;
    return renamer(hctrl);
}

function imk_peak_o(ds,dd,fs,ss,hyst,hctrl){
    let ll=hctrl.ll, ff=0;
    const sy=hyst.sy, as=hyst.as, My=hyst.My, dp=hyst.dp, dpc=hyst.dpc, Res=hyst.Res, du=hyst.du, dt0=hyst.dt0;
    const dy=[My[0]/sy,My[1]/sy], dc=arrAdd([dy,dp]), sc=[as[0]*sy,as[1]*sy], fc=[My[0]+sc[0]*(dc[0]-dy[0]),My[1]+sc[1]*(dc[1]-dy[1])], sr=[-fc[0]/dpc[0],-fc[1]/dpc[1]], fr=[Res[0]*My[0],Res[1]*My[1]];
    const ls=hyst.ls, lc=hyst.lc, la=hyst.la, lk=hyst.lk, cs=hyst.cs, cc=hyst.cc, ca=hyst.ca, ck=hyst.ck, D=hyst.D, ey=(My[0]*dy[0]+My[1]*dy[1])/2;
    let fi=hctrl.fi, fri=hctrl.fri, ksi=hctrl.ksi, kui=hctrl.kui, dti=hctrl.dti, e=hctrl.e, ek=hctrl.ek, dm=hctrl.dm, fm=hctrl.fm, d1=hctrl.d1, f1=hctrl.f1;
    let res={},is=1,fb=0,bk=0,iii=0,r=0,db=NaN;
    if(ll===1){
        fi=My.map(val=>val);
        fri=[fc[0]-sr[0]*dc[0],fc[1]-sr[1]*dc[1]];
        ksi=sc.map(val=>val);
        kui=sy;
        e=[0,0];
        ek=[0];
        fm=My.map(val=>val);
        dm=dy.map(val=>val);
        dti=[-0,0];
    }
    if(dd<ds) is=0;
    else is=1;
    di=arrAdd([dm,dti]);
    while(iii<10){
        iii++;
        if(dd===ds){
            ff=fs;
            break;
        }else if(ll===0){
            ff=0;
            ss=0;
            break;
        }else if(!isFinite(dd)){
            ll=0;
            console.log("Displacement Overflow");
        }else if(ll===1){
            if(dy[0]<dd && dd<dy[1]){
                res=primary(ll,dd,sy,fr,sr,du,di,fi,fri,ksi);
                ll=res.ll;
                ff=res.ff;
                ss=res.ss;
                break;
            }else{
                ll=2;
                r=1;
                if(dd>0) f1=-1;
                else f1=1;
                e=update_e(e,0,dy[is],fs,My[is]);
                ek=update_e(ek,0,dy[is],fs,My[is]);
            }
        }else if(ll===2){
            if((dd-ds)*f1<0){
                res=primary(ll,dd,sy,fr,sr,du,di,fi,fri,ksi);
                ll=res.ll;
                ff=res.ff;
                ss=res.ss;
                if(r===1){
                    e =update_e_rule2(e ,di[is],dd,fi[is],ff,sr,fr,du,di,fi,fri,ksi);
                    ek=update_e_rule2(ek,di[is],dd,fi[is],ff,sr,fr,du,di,fi,fri,ksi);
                }
                break;
            }else{
                ll=3;
                ei=ek[0];
                if(ei<0) ei=0;
                bk=(ei/(lk*ey-sum(e)))**ck*D[1-is];
                kui=[(1-bk)*kui,kui];
                ek.unshift(0);
                ss=kui[0];
                d1=ds;
                f1=fs;
                dm[1-is]=d1;
                fm[1-is]=f1;
                fi[1-is]=f1;
            }
        }else if(ll===3){
            let d0=ds-fs/ss;
            if((d1-dd)*(d0-dd)<0){
                ff=ss*(dd-d0);
                break;
            }else{
                r=1;
                if((d0-dd)*(d0-ds)<=0){
                    ll=4;
                    db=d0;
                    fb=0;
                    e=update_e(e,ds,db,fs,fb);
                    ek=update_e(ek,ds,db,fs,fb);
                    ei=e[0]+e[1];
                    if(ei<0) ei=0;
                    if(Math.min(ls,lc,la)*ey-sum(e)<ei){
                        ll=0;
                        ff=0;
                        ss=0;
                        console.log("Beyond Energy Capacity");
                        break;
                    }
                    if(e[1]===0) dti=dt0;
                    e.unshift(0);
                    kui=kui[0];
                    bs=(ei/(ls*ey-sum(e)))**cs*D[is];
                    bc=(ei/(lc*ey-sum(e)))**cc*D[is];
                    ba=(ei/(la*ey-sum(e)))**ca*D[is];
                    fm[is]=(1-bs)*fm[is];
                    ksi[is]=(1-bs)*ksi[is];
                    fri[is]=(1-bc)*fri[is];
                    dti[is]=(1+ba)*dti[is];
                    if(dm[is]===dy[is]) dm[is]=fm[is]/sy;
                    di=arrAdd([dm,dti]);
                    res=primary(ll,di[is],sy,fr,sr,du,dm,fm,fri,ksi);
                    fi[is]=res.ff;
                    ss=fi[is]/(di[is]-d0);
                    if(f1===0) f1=1-2*is;
                }else{
                    db=d1;
                    fb=f1;
                    e=update_e(e,ds,db,fs,fb);
                    ek.shift();
                    kui=kui[1];
                    if(d1===dm[is]){
                        ll=2;
                        di[is]=dm[is];
                    }else{
                        ll=4;
                        ss=(fi[is]-f1)/(di[is]-d1);
                    }
                    f1=-f1;
                }
            }
        }else if(ll===4){
            if((dd-ds)*f1<0){
                if(dd/di[is]<1){
                    ll=4;
                    ff=fi[is]+ss*(dd-di[is]);
                    if(r===1){
                        e=update_e(e,db,dd,fb,ff);
                        ek=update_e(ek,db,dd,fb,ff);
                    }
                    break;
                }else{
                    ll=2;
                    r=1;
                    if(isNaN(db)){
                        e=update_e(e,ds,di[is],fs,fi[is]);
                        ek=update_e(ek,ds,di[is],fs,fi[is]);
                    }else{
                        e=update_e(e,db,di[is],fb,fi[is]);
                        ek=update_e(ek,db,di[is],fb,fi[is]);
                    }
                }
            }else{
                ll=3;
                ei=ek[0];
                if(ei<0) ei=0;
                bk=(ei/(lk*ey-sum(e)))**ck*D[1-is];
                kui=[(1-bk)*kui,kui];
                ek.unshift(0);
                if(ss<kui[0]) ss=kui[0];
                d1=ds;
                f1=fs;
            }
        }
    }
    if(r===0 && ll!=1){
        if(ll===2){
            e =update_e_rule2(e ,ds,dd,fs,ff,sr,fr,du,di,fi,fri,ksi);
            ek=update_e_rule2(ek,ds,dd,fs,ff,sr,fr,du,di,fi,fri,ksi);
        }else{
            e =update_e(e ,ds,dd,fs,ff);
            ek=update_e(ek,ds,dd,fs,ff);
        }
    }
    hctrl.ll=ll;
    hctrl.ff=ff;
    hctrl.ss=ss;
    hctrl.fi=fi;
    hctrl.fri=fri;
    hctrl.ksi=ksi;
    hctrl.kui=kui;
    hctrl.dti=dti;
    hctrl.e=e;
    hctrl.ek=ek;
    hctrl.dm=dm;
    hctrl.fm=fm;
    hctrl.d1=d1;
    hctrl.f1=f1;
    return hctrl;
}

function primary(ll,dd,sy,fr,sr,du,di,fi,fri,ksi){
    let res={};
    res.ll=ll;
    if(ll===1){
        res.ss=sy;
        res.ff=sy*dd;
    }else{
        let fi1=[],dr=[],dc=[],fc=[];
        for(let k of [0,1]){
            fi1[k]=sr[k]*di[k]+fri[k];
            if(Math.abs(fi[k])>Math.abs(fi1[k])) fi[k]=fi1[k];
            dr[k]=(fr[k]-fri[k])/sr[k];
            if(Math.abs(di[k])>Math.abs(dr[k]) || Math.abs(fi[k])<Math.abs(fr[k])) fi[k]=fr[k];
            dc[k]=(ksi[k]*di[k]+fri[k]-fi[k])/(ksi[k]-sr[k]);
            fc[k]=fri[k]+sr[k]*dc[k];
        }
        if(dd>0) is=1;
        else is=0;
        if(Math.abs(dd)>Math.abs(du[is])){
            if(ll!=0) console.log("Beyond Displacement Capacity");
            res.ss=0;
            res.ff=0;
            res.ll=0;
        }else if(Math.abs(dd)>Math.abs(dr[is])){
            res.ss=0;
            res.ff=fr[is];
        }else if(Math.abs(dd)>Math.abs(dc[is])){
            res.ss=sr[is];
            res.ff=fc[is]+(dd-dc[is])*sr[is];
        }else{
            res.ss=ksi[is];
            res.ff=fi[is]+(dd-di[is])*ksi[is];
        }
    }
    return res;
}

function update_e(e,ds,dd,fs,ff){
    e[0]+=(dd-ds)*(ff+fs)/2;
    return e
}

function update_e_rule2(e,ds,dd,fs,ff,sr,fr,du,di,fi,fri,ksi){
    let dc=[],fc=[],dr=[],D=[ds],F=[fs],de=0;
    for(let k of [0,1]){
        dc[k]=(ksi[k]*di[k]+fri[k]-fi[k])/(ksi[k]-sr[k]);
        fc[k]=fri[k]+sr[k]*dc[k];
        dr[k]=(fr[k]-fri[k])/sr[k];
    }
    if(dd<ds) is=0;
    else is=1;
    if(Math.abs(dd)>Math.abs(du[is])){
        dd=du[is];
        ff=fr[is];
    }
    if(ds<dc[is]&&dc[is]<dd){
        D.push(dc[is]);
        F.push(fc[is]);
    }
    if(ds<dr[is]&&dr[is]<dd){
        D.push(dr[is]);
        F.push(fr[is]);
    }
    D.push(dd);
    F.push(ff);
    for(let k=0; k<D.length-1; k++) de+=(F[k+1]+F[k])*(D[k+1]-D[k])/2;
    e[0]+=de;
    return e;
}
