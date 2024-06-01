export interface VirusTotalDomain {
  data: {
    attributes: {
      categories: Record<string, string>;
      creation_date: number;
      favicon: {
        dhash: string;
        raw_md5: string;
      };
      jarm: string;
      last_analysis_date: number;
      last_analysis_results: Record<
        string,
        {
          category: string;
          engine_name: string;
          method: string;
          result: string;
        }
      >;
      last_analysis_stats: {
        harmless: number;
        malicious: number;
        suspicious: number;
        timeout: number;
        undetected: number;
      };
      last_dns_records: {
        expire: number;
        flag: number;
        minimum: number;
        priority: number;
        refresh: number;
        rname: string;
        retry: number;
        serial: number;
        tag: string;
        ttl: number;
        type: string;
        value: string;
      }[];
      last_dns_records_date: number;
      last_https_certificate: SSLCertificate;
      last_https_certificate_date: number;
      last_modification_date: number;
      last_update_date: number;
      popularity_ranks: Record<
        string,
        {
          rank: number;
          timestamp: number;
        }
      >;
      registrar: string;
      reputation: number;
      tags: string[];
      total_votes: {
        harmless: number;
        malicious: number;
      };
      whois: string;
      whois_date: number;
    };
    id: string;
    links: {
      self: string;
    };
    type: 'domain';
  };
}

interface SSLCertificate {
  type: 'ssl_cert';
  id: string;
  attributes: {
    cert_signature: {
      signature: string;
      signature_algorithm: string;
    };
    extensions: {
      CA: boolean;
      authority_key_identifier: {
        keyid: string;
        serial_number: string;
      };
      ca_information_access: Record<string, string>;
      certificate_policies: string[];
      cert_template_name_dc: string;
      crl_distribution_points: string[];
      extended_key_usage: string[];
      key_usage: string[];
      netscape_cert_comment: string;
      netscape_certificate: boolean;
      old_authority_key_identifier: boolean;
      pe_logotype: boolean;
      subject_alternative_name: string[];
      subject_key_identifier: string;
      tags: string[];
    };
    first_seen_date: number;
    issuer: {
      C: string;
      CN: string;
      L: string;
      O: string;
      OU: string;
      ST: string;
    };
    public_key: {
      algorithm: string;
      rsa?: {
        key_size: number;
        modulus: string;
        exponent: string;
      };
      dsa?: {
        p: string;
        q: string;
        g: string;
        pub: string;
      };
      ec?: {
        oid: string;
        pub: string;
      };
    };
    serial_number: string;
    signature_algorithm: string;
    size: number;
    subject: {
      C: string;
      CN: string;
      L: string;
      O: string;
      OU: string;
      ST: string;
    };
    thumbprint: string;
    thumbprint_sha256: string;
    validity: {
      not_after: string;
      not_before: string;
    };
    version: string;
  };
  links: {
    self: string;
  };
}
