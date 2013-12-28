<?php echo $header; ?>
<?php echo $column_left; ?><?php echo $column_right; ?>
<div id="content">
	<div class="top">
		<div class="center">
			<h1><?php echo $heading_title; ?></h1>
		</div>
	</div>
	
 <div class="track_result">
		<?php if($barespond) { ?>
		<div id="info_wrap">
			<div class="routeStartLoc <?php echo $originCountryCode ?>"><span>ИЗ >:&nbsp;</span><span class="flag-<?php echo strtolower($originCountryCode) ?>"></span></div>
			<div class="routeEndLoc <?php echo $destinationCountryCode ?>"><label>В >:&nbsp;</label><span class="flag-<?php echo strtolower($destinationCountryCode) ?>"></span></div>
			<div class="number"><label>Номер :&nbsp;</label><span><?php echo $number ?></span></div>
			<div class="transitTime"><label>Дней в пути :&nbsp;<?php echo $trackTime ?></label><span></span></div>
		</div>
			<div class="clr"></div>
			<table class="table table-bordered table-condensed table-tracker table-striped text-left">
				<tbody>
					<?php foreach ($postresult as $tracs=>$tracdata) { ?>
						<tr class="track">
							<td class="date"><?php $date = date_create($tracdata['date']); echo date_format($date, 'd.m.Y | H:i');  ?></td>
							<td class="place zip"><?php echo $tracdata['place'] ?>, <?php echo "<a href='https://moyaposylka.ru/zip/RU/".$tracdata['zip']."' target='_blank' >" . $tracdata['zip'] . "</a>" ?></td>
							<td class="operation"><?php echo $tracdata['operation'] ?> / <?php echo $tracdata['attribute'] ?></td>
						</tr>
					<?php } ?>
				</tbody>
			</table>
		<?php } else { ?>
			<div class="error_barcode"><?php echo $error_barcode ?></div>
		<?php } ?>
	
 </div>
	
</div>

<?php echo $footer; ?>