<div class="box">
    <div class="top"><img src="catalog/view/theme/default/image/post.png" alt=""/><?php echo $heading_title; ?></div>
    <div id="compare_middle" class="middle">
        <form method="post" action="<?php echo $action?>" id="posttracker">
            <table>
                <tr>
                    <td>
                        <?php echo $text_track_number?>
                    </td>
                </tr>
                <tr>
                    <td>
                    	<input type="text" id="track-number" name="track-number" value="" size="25" maxlength="60" autocomplete="on">
                    </td>
                </tr>
                <tr>
                	<td>
		                <div id="carriers" style="clear: both; display: inline-block; ">
						<input id="ems" checked="" name="carrier" type="radio" value="ems"><span>EMS (Россия)</span>
						<input id="usps" name="carrier" type="radio" value="usps"><span>USPS</span>
						<input id="tnt" name="carrier" type="radio" value="tnt"><span>TNT</span>
						<input id="dhl" name="carrier" type="radio" value="dhl"><span>DHL</span>
						</div>
                	</td>
                </tr>
                <tr>
                    <td>
                        <input type="submit" value="<?php echo $text_find?>" class="iskat" onclick="return CheckInputCode();">
                    </td>
                </tr>
            </table>
            <div ms_positioning="FlowLayout" style="COLOR: red; DISPLAY: inline; WIDTH: 50%; HEIGHT: 15px" id="lblBrcdErrMsg"></div>
        </form>
        <script type="text/javascript">
        function CheckInputCode(){
            var BarCode= document.getElementById("track-number");
            var lblBrcdErrMsg= document.getElementById("lblBrcdErrMsg");

            if(BarCode.value == "") {
                lblBrcdErrMsg.innerHTML  = "<?php echo $error_barcode?>";
                return false;
            }

            var checkPatern = /\d{14}/;
            if(!checkPatern.test(BarCode.value)) {
                var chechInternationalWorld = /[a-z]{2}\d{9}[a-z]{2}$/i;
                if(!chechInternationalWorld.test(BarCode.value)) {
                var checkHZ = /[a-z]{2}\d{8}[a-z]{3}$/i;
                if(!checkHZ.test(BarCode.value)) {
                    lblBrcdErrMsg.innerHTML  = "<?php echo $error_barcode?>";
                    return false;
                }
                }
            }

            $("#posttracker").submit();
            return true;
        }
        </script>
    </div>
    <div class="bottom">
    </div>
</div>
