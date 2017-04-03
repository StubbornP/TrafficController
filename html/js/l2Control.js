function trim_zero(obj) {
    return String(obj).replace(/^0+/, "");
}

function dpid_to_int(dpid) {
    return Number("0x" + dpid);
}

Callbacks = {
    "dpid":1,
    "port":0,
    "switch_states":{},
    "port_link_state":{},
    "switch_search" : function(cb){

         dpid = Callbacks['dpid'] = $("#switchSearchInput").val();

        $.get("/stats/port/"+dpid,{},function( data, status){

            $.get("/v1.0/topology/links",{},function( links, link_status){

                port_link_state_dict = {}

                link_process = function( link ,dict){

                    if( link['src'] && link['src']['dpid'] ){
                        dpid = dpid_to_int(link['src']['dpid'])
                        port = dpid_to_int(link['src']['port_no'])

                        if(!dict[dpid])
                            dict[ dpid ] = {};
                        dict[ dpid ] [port] = {
                                'name': link['src']['name'],
                                'hw_addr':link['src']['hw_addr']
                                }
                    }

                     if( link['dst'] && link['dst']['dpid'] ){
                        dpid = dpid_to_int(link['dst']['dpid'])
                        port = dpid_to_int(link['dst']['port_no'])

                        if(!dict[dpid])
                            dict[ dpid ] = {};
                        dict[ dpid ] [port] = {
                                'name': link['dst']['name'],
                                'hw_addr':link['dst']['hw_addr']
                                }
                    }
                    return dict;
                }

                for( link_idx in links){
                    port_link_state_dict = link_process( links[link_idx], port_link_state_dict);
                }
                Callbacks['port_link_state'] = port_link_state_dict;
                if(cb){
                    cb( data, status)
                }
            });
        });
    },
    "switch_search_click":function(){
        Callbacks['switch_search'](function( data, status ){

            dpid = Callbacks['dpid'];

            Callbacks.switch_states = data[dpid]
            data={ "data": Callbacks.switch_states}
            //http://192.168.111.128:8080/v1.0/topology/links/0000000000000001

            var pagefn = doT.template(document.getElementById('portListTemp').text, undefined, data);
	        document.getElementById('interface-list-warp').innerHTML = pagefn(data)


        });
    },
    "refresh_port_info":function(idx){

        Callbacks['port'] = idx;
        Callbacks['switch_search'](function( data, status ){

            data = Callbacks.switch_states[idx]
            dpid = Callbacks['dpid'];
            port_no = data['port_no'];

            if( Callbacks['port_link_state'][dpid][port_no] ){
             data['port_name'] = Callbacks['port_link_state'][dpid][port_no]['name'];
             data['hw_addr'] = Callbacks['port_link_state'][dpid][port_no]['hw_addr'];
            }

            var pagefn = doT.template(document.getElementById('portInfotableTemp').text, undefined, {} );
            document.getElementById('portInfo').innerHTML = pagefn(data)
            });
    }
}

function main(){

    dummy={
        "tx_dropped": 0,
        "rx_packets": 0,
        "rx_crc_err": 0,
        "tx_bytes": 0,
        "rx_dropped": 0,
        "port_no": 0,
        "rx_over_err": 0,
        "rx_frame_err": 0,
        "rx_bytes": 0,
        "tx_errors": 0,
        "collisions": 0,
        "rx_errors": 0,
        "tx_packets": 0
    }
    var pagefn = doT.template(document.getElementById('portInfotableTemp').text, undefined, {});
    document.getElementById('portInfo').innerHTML = pagefn(dummy)
}
main();
