<?php
class ControllerModuleposttracker extends Controller {
	protected function index() {
		$this->language->load('module/posttracker');

		$this->data['heading_title'] = $this->language->get('heading_title');
		$this->data['error_barcode'] = $this->language->get('error_barcode');
		$this->data['text_track'] = $this->language->get('text_tracker');
		$this->data['text_track_number'] = $this->language->get('text_track_number');
		$this->data['text_find'] = $this->language->get('text_find');
		$this->data['action'] = HTTP_SERVER . "index.php?route=module/posttracker/find";
		$this->id = 'posttracker';

		if (file_exists(DIR_TEMPLATE . $this->config->get('config_template') . '/template/module/posttracker.tpl')) {
			$this->template = $this->config->get('config_template') . '/template/module/posttracker.tpl';
		} else {
			$this->template = 'default/template/module/posttracker.tpl';
		}
		
		$this->render();
	}


	public function find() {

		$this->language->load('module/posttracker');
		
		$this->data['heading_title'] = $this->language->get('heading_title');	
		
		if(file_exists('../catalog/view/theme/' . $this->config->get('config_template') . '/stylesheet/posttracker.css')) {
			$this->document->addStyle('catalog/view/theme/' . $this->config->get('config_template'). '/stylesheet/posttracker.css');
		} else {
			$this->document->addStyle('catalog/view/theme/default/stylesheet/posttracker.css');
		}
		
		if ($this->request->server['REQUEST_METHOD'] == 'POST' && $this->validate()) {
			$urlsours = 'https://moyaposylka.ru/api/json/tracker/v1';
			$barCode = $this->request->post['track-number'];
			
			$request_data = array('method' => 'getStatuses', 'id' => '1', 'params' => array('number' => $barCode), "jsonrpc" => "2.0");
			
			$json = json_encode($request_data);
			
			$ch = curl_init($urlsours);
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
			curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			$result = curl_exec($ch);
						
			curl_close($ch);
			
			$obj = json_decode($result, true);
			if (array_key_exists('error', $obj)) {
					$this->data['barespond'] = 0;
					$this->data['error_barcode'] = sprintf($this->language->get('error_not_found'), $barCode);
			} else {
				$this->data['barespond'] = 1;
				$this->data['number'] = $obj['result']['number'];
				$this->data['originCountryCode'] = $obj['result']['originCountryCode'];
				$this->data['destinationCountryCode'] = $obj['result']['destinationCountryCode'];
				$this->data['isDelivered'] = $obj['result']['isDelivered'];
				$this->data['isStopped'] = $obj['result']['isStopped'];
				$this->data['weight'] = $obj['result']['weight'];
				$this->data['trackTime'] = $obj['result']['trackTime'];
				$this->data['lastUpdatedAt'] = $obj['result']['lastUpdatedAt'];
				
				$postresult = $obj['result']['statuses'];
				$startdate = reset($postresult);
				$enddate = end($postresult);
				$fdateone = date_create($startdate['date']);
				$fdatetwo = date_create($enddate['date']);
				$interval = date_diff($fdatetwo, $fdateone);
				$this->data['dayinterval'] = $interval->format('%R%a дней');
				$this->data['postresult'] = array_reverse($postresult);
				
			}		
			
		}
		
		
		
		if (file_exists(DIR_TEMPLATE . $this->config->get('config_template') . '/template/module/tracker_result.tpl')) {
			$this->template = $this->config->get('config_template') . '/template/module/tracker_result.tpl';
		} else {
			$this->template = 'default/template/module/tracker_result.tpl';
		}

		if (isset($this->error['error_barcode'])) {
			$this->data['error_barcode'] = $this->error['error_barcode'];
		}
		$this->children = array(
			'common/footer',
			'common/header',
			'common/column_left',
			'common/column_right'
		);

		$this->response->setOutput($this->render(TRUE), $this->config->get('config_compression'));

	}

	private function validate() {
		if (!isset($this->request->post['track-number'])) {
			$this->error['error_barcode'] = $this->language->get('error_barcode');
		}

		if (!$this->error) {
			return TRUE;
		} else {
			return FALSE;
		}

	}
}

?>